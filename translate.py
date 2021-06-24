import sys
import polib
import json
import os.path
import itertools
import enum
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials


class LangCode(enum.Enum):
    HMONG = "hmn"
    SPANISH = "es"
    ARABIC = "ar"
    
    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_ 

class Function(enum.Enum):
    INPUT = "in"
    OUTPUT = "out"
    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_ 

class Scope(enum.Enum):
    NEEDS_TRANSLATION = "nt"
    ALL = "all"
    
    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_ 

class Location(enum.Enum):
    DOC = "doc"
    TEXT = "txt"
    
    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_ 

# For Google Docs
AVAILABLE_DOCS = {
    LangCode.HMONG: "1LIW0fBZZbPdsGUI4OscbbzIQOxX0JPTR0aCR0fIAcbg",
    LangCode.SPANISH: "1__HPfzYGmRVH9QeF9YIjAiniO2vzdU9MlKhjnksSSF4",
    LangCode.ARABIC: "1Busdjt7pEGMlVZyr9eUhiL8wz_N7Y9NFYtRgwMX2MlM"
}

# Ignore translating occurrences from these files. Outputted from Django so users will never see
IGNORE_OCCURRENCES = {
    "venv/lib/python3.7/site-packages/django/views/templates/default_urlconf.html",
    "venv/lib/python3.7/site-packages/ckeditor_uploader/templates/ckeditor/browse.html"
}

SCOPES = ['https://www.googleapis.com/auth/documents']

def get_google_creds():
    creds = None
    # The file google_token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('google_token.json'):
        creds = Credentials.from_authorized_user_file('google_token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'google_credentials.json', SCOPES)
            creds = flow.run_local_server(port=53131)
        # Save the credentials for the next run
        with open('google_token.json', 'w') as token:
            token.write(creds.to_json())

    return creds

def _contains_only_ignored_occurrences(entry):
    if not entry:
        return False
    for occurrence in entry.occurrences:
        if occurrence[0] not in IGNORE_OCCURRENCES:
            return False
    
    return True

##################### For use with Google Docs ############################
def _output_to_doc(lang_code, pofile, service, translate_all):
    initial_requests = []
    pop_table_requests = []
    startIndex = -1
    endIndex = -1
    document = service.documents().get(documentId=AVAILABLE_DOCS[lang_code]).execute()
    pofile_length = len(pofile)

    # Delete all the elements that currently is in the document
    number_of_existing_elements = len(document['body']['content'])
    for i in range(1, number_of_existing_elements - 1):
        element = document['body']['content'][i]
        if i == 1:
            startIndex = element['startIndex']
        if i == number_of_existing_elements - 2:
            endIndex = element['endIndex']

    if number_of_existing_elements > 2:
        initial_requests.append({
            'deleteContentRange': {
                'range': {
                    'segmentId': '',
                    'startIndex': startIndex,
                    'endIndex': endIndex
                }
            }
        })

    # Add an empty table with the necessary number of rows
    initial_requests.append({
        'insertTable': {
            'rows': pofile_length + 1, # enough rows for all translations + the header row
            'columns': 2,
            'endOfSegmentLocation': {
                'segmentId': ''
            }
        }
    })

    result = service.documents().batchUpdate(documentId=AVAILABLE_DOCS[lang_code], body={'requests': initial_requests}).execute()

    # Retrieve the document with the table for the purpose of having access to the indexes of the table cells
    document = service.documents().get(documentId=AVAILABLE_DOCS[lang_code]).execute()

    # Populate the table rows and cells
    table_rows = document['body']['content'][2]['table']['tableRows']
    for row, entry in itertools.zip_longest(reversed(table_rows), reversed(pofile)):
        sec_column_text = entry.msgstr if entry else lang_code.name
        first_column_text = entry.msgid if entry else "ENGLISH (DO NOT EDIT THIS COLUMN!!!)"

        if _contains_only_ignored_occurrences(entry):
            sec_column_text = "(IGNORE)"
        if sec_column_text and not translate_all or sec_column_text in LangCode.__members__ or sec_column_text == "(IGNORE)":
            pop_table_requests.append(   
                {
                    'insertText': {
                        'location': {
                            'index': row['tableCells'][1]["content"][0]["startIndex"]
                        },
                        'text': sec_column_text
                    }
                }
            )
        pop_table_requests.append(
            {
                'insertText': {
                    'location': {
                        'index': row['tableCells'][0]["content"][0]["startIndex"]
                    },
                    'text': first_column_text
                }
            }
        )
        

    result = service.documents().batchUpdate(documentId=AVAILABLE_DOCS[lang_code], body={'requests': pop_table_requests}).execute()
    print("{} phrases outputted".format(pofile_length))

def _get_translations_from_doc(lang_code, service):
    translations = {}
    document = service.documents().get(documentId=AVAILABLE_DOCS[lang_code]).execute()
    table_rows = document['body']['content'][2]['table']['tableRows']
    for row in table_rows[1:]:
        doc_msgid = row['tableCells'][0]["content"][0]["paragraph"]["elements"][0]["textRun"]["content"]
        doc_msgstr = row['tableCells'][1]["content"][0]["paragraph"]["elements"][0]["textRun"]["content"]
        translations[doc_msgid.replace("\n", "")] = doc_msgstr.replace("\n", "")

    return translations

def output_all_msgids(lang_code, pofile, service):
    run_makemessages(lang_code)
    _output_to_doc(lang_code, pofile, service, False)

def output_needs_translation(lang_code, pofile, service):
    run_makemessages(lang_code)
    _output_to_doc(lang_code, pofile.untranslated_entries() + pofile.fuzzy_entries(), service, True)

def input_needed_translations(lang_code, pofile, pofile_path, service):
    prior_percent_translated = pofile.percent_translated()
    prior_num_needs_translations = len(pofile.untranslated_entries() + pofile.fuzzy_entries())
    translations = _get_translations_from_doc(lang_code, service)

    for entry in pofile.untranslated_entries() + pofile.fuzzy_entries():
        entry.msgstr = translations.get(entry.msgid, entry.msgstr)
    
    pofile.save(pofile_path)
    run_compilemessages(lang_code)
    print("{difference} more translations added".format(difference=prior_num_needs_translations - len(pofile.untranslated_entries() + pofile.fuzzy_entries())))
    print("Percent translated went from: {prior}% to {current}%".format(prior=prior_percent_translated, current=pofile.percent_translated()))

def input_all_translations(lang_code, pofile, pofile_path, service):
    prior_percent_translated = pofile.percent_translated()
    translations = _get_translations_from_doc(lang_code, service)

    for entry in pofile:
        entry.msgstr = translations.get(entry.msgid, entry.msgstr)
    
    pofile.save(pofile_path)
    run_compilemessages(lang_code)
    print("Percent translated went from: {prior}% to {current}%".format(prior=prior_percent_translated, current=pofile.percent_translated()))


#################### For Use with Text Files ##############################
def _get_translations_from_txt(lang_code):
    translations = {}
    with open("{}_translations.txt".format(lang_code.value), "r") as transdoc:
        for line in transdoc:
            if line == "\n":
                continue
            translations.update((json.loads(line)))
    return translations

def input_needed_translations_txt(lang_code, pofile, pofile_path):
    prior_percent_translated = pofile.percent_translated()
    translations = _get_translations_from_txt(lang_code)

    for entry in pofile.untranslated_entries() + pofile.fuzzy_entries():
        entry.msgstr = translations.get(entry.msgid, entry.msgstr)
    
    pofile.save(pofile_path)
    run_compilemessages(lang_code)
    print("Percent translated went from: {prior}% to {current}%".format(prior=prior_percent_translated, current=pofile.percent_translated()))

def input_all_translations_txt(lang_code, pofile, pofile_path):
    prior_percent_translated = pofile.percent_translated()
    translations = _get_translations_from_txt(lang_code)
    
    for entry in pofile:
        entry.msgstr = translations.get(entry.msgid, entry.msgstr)
    
    pofile.save(pofile_path)
    run_compilemessages(lang_code)
    print("Percent translated went from: {prior}% to {current}%".format(prior=prior_percent_translated, current=pofile.percent_translated()))

def output_all_msgids_txt(lang_code, pofile):
    with open("{}_translations.txt".format(lang_code.value), 'w') as transdoc:
        for entry in pofile:
            if _contains_only_ignored_occurrences(entry):
                continue
            json.dump({entry.msgid:entry.msgstr}, transdoc)
            transdoc.write("\n\n")

def output_needs_translation_txt(lang_code, pofile):
    with open("{}_translations.txt".format(lang_code.value), 'w') as transdoc:
        for entry in pofile.untranslated_entries() + pofile.fuzzy_entries():
            if _contains_only_ignored_occurrences(entry):
                continue
            json.dump({entry.msgid:""}, transdoc)
            transdoc.write("\n\n")

####################### Django Messages Functions #############################
def run_makemessages(lang_code):
    os.system("python manage.py makemessages -l {lang} -e html,txt".format(lang=lang_code.value))

def run_compilemessages(lang_code):
    os.system("python manage.py compilemessages -l {lang}".format(lang=lang_code.value))


def main(argv):
    lang_code, function, scope, location = _validate_arguments(argv)
    
    if location == Location.DOC:
        creds = get_google_creds()
        service = build('docs', 'v1', credentials=creds)

    pofile_path = "./representable/<representable>locale/{}/LC_MESSAGES/django.po".format(lang_code.value)
    pofile = polib.pofile(pofile_path)

    if function == Function.INPUT:
        if scope == Scope.NEEDS_TRANSLATION:
            if location == Location.DOC:
                input_needed_translations(lang_code, pofile, pofile_path, service)
            elif location == Location.TEXT:
                input_needed_translations_txt(lang_code, pofile, pofile_path)
        elif scope == Scope.ALL:
            if location == Location.DOC:
                input_all_translations(lang_code, pofile, pofile_path, service)
            elif location == Location.TEXT:
                input_all_translations_txt(lang_code, pofile, pofile_path)
    elif function == Function.OUTPUT:
        if scope == Scope.NEEDS_TRANSLATION:
            if location == Location.DOC:
                output_needs_translation(lang_code, pofile, service)
            elif location == Location.TEXT:
                output_needs_translation_txt(lang_code, pofile)
        elif scope == Scope.ALL:
            if location == Location.DOC:
                output_all_msgids(lang_code, pofile, service)
            elif location == Location.TEXT:
                output_all_msgids_txt(lang_code, pofile)

def _validate_arguments(argv):
    num_args = len(argv)
    if num_args < 3:
        raise ValueError("The language code and input/output options are required.")
    
    if num_args > 5:
        raise ValueError("Too many arguments")

    [arg.lower() for arg in argv]
    
    if not LangCode.has_value(argv[1]):
        raise ValueError("The language code you entered is not valid or not supported yet. The available language codes are {}.\n{}".format([langcode.value for langcode in AVAILABLE_DOCS], _explain_input()))
    else:
        argv[1] = LangCode(argv[1])

    if not Function.has_value(argv[2]):
        raise ValueError("You must pass in the parameter 'in' to input translations or 'out' to output translations.\n{}".format(_explain_input()))
    else:
        argv[2] = Function(argv[2])

    if num_args < 4:
        argv.extend([Scope.NEEDS_TRANSLATION, Location.DOC])
        return argv[1], argv[2], argv[3], argv[4]

    if not Scope.has_value(argv[3]):
        print("WARNING: '{}' is not a valid parameter for the scope. Using the default value 'nt'.\n{}".format(argv[3], _explain_input()))
        argv[3] = Scope.NEEDS_TRANSLATION
    else:
        argv[3] = Scope(argv[3])

    if num_args < 5:
        argv.append(Location.DOC)
        return argv[1], argv[2], argv[3], argv[4]

    if not Location.has_value(argv[4]):
        print("WARNING: '{}' is not a valid parameter for the scope. Using the default value 'doc'.\n{}".format(argv[4], _explain_input()))
        argv[4] = Location.DOC
    else:
        argv[4] = Location(argv[4])

    return argv[1], argv[2], argv[3], argv[4]

def _explain_input():
    return "Run using 'python translate.py [language code (Required)] [function (Required)] [scope] [location]'\nRun 'python translate.py --help' for more info"

def _help():
    return  '''
                argv[1] (REQUIRED) : the language code
                        hmn - Hmong, es - Spanish, ar - Arabic

                argv[2] (REQUIRED): the function to perform
                        in - Input translations
                        out - Output msgids to be translated

                argv[3] : scope of the function
                        nt (DEFAULT) - output or input translations for only the msgids that need translations (they are fuzzy or untranslated) 
                        all - output all msgids to be translated or input translations for all msgids

                argv[4] : Output/Input to/from Doc or Text file
                        doc (DEFAULT) - output or input translations to the google doc for the specified language
                        txt - output or input translations to the text file for the specified language. If inputting, the text file must be in the same
                                directory as this script
            '''
if __name__ == "__main__":
    if sys.argv[1] == "--help":
        print(_help())
    else:
        main(sys.argv)