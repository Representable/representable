import sys
import polib
import json
import os.path
import itertools
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# For Google Docs
HMN_DOCUMENT_ID = "1LIW0fBZZbPdsGUI4OscbbzIQOxX0JPTR0aCR0fIAcbg"
ES_DOCUMENT_ID = "1__HPfzYGmRVH9QeF9YIjAiniO2vzdU9MlKhjnksSSF4"
AR_DOCUMENT_ID = "1Busdjt7pEGMlVZyr9eUhiL8wz_N7Y9NFYtRgwMX2MlM"
DOCUMENT_ID = ""
SCOPES = ['https://www.googleapis.com/auth/documents']

def get_document_id(lang_code):
    if lang_code == "hmn":
        return HMN_DOCUMENT_ID
    elif lang_code == "es":
        return ES_DOCUMENT_ID
    elif lang_code == "ar":
        return AR_DOCUMENT_ID:
    else:
        raise RuntimeError("The lang code you passed in is not valid or not supported yet.")

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

##################### For use with Google Docs ############################
def _output_to_doc(lang_code, pofile, service, translate_all):
    initial_requests = []
    pop_table_requests = []
    startIndex = -1
    endIndex = -1
    document = service.documents().get(documentId=HMN_DOCUMENT_ID).execute()
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
            'rows': pofile_length + 1,
            'columns': 2,
            'endOfSegmentLocation': {
                'segmentId': ''
            }
        }
    })

    result = service.documents().batchUpdate(documentId=HMN_DOCUMENT_ID, body={'requests': initial_requests}).execute()

    # Retrieve the document with the table for the purpose of having access to the indexes of the table cells
    document = service.documents().get(documentId=HMN_DOCUMENT_ID).execute()

    # Populate the table rows
    table_rows = document['body']['content'][2]['table']['tableRows']
    for row, entry in itertools.zip_longest(reversed(table_rows), reversed(pofile)):
        sec_column_text = entry.msgstr if entry else "Hmong"
        first_column_text = entry.msgid if entry else "English"
        if sec_column_text and not translate_all or sec_column_text == "Hmong":
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
        

    result = service.documents().batchUpdate(documentId=HMN_DOCUMENT_ID, body={'requests': pop_table_requests}).execute()
    print("{} phrases outputted".format(pofile_length))

def output_all_msgids(lang_code, pofile, service):
    _output_to_doc(lang_code, pofile, service, False)

def output_needs_translation(lang_code, pofile, service):
    _output_to_doc(lang_code, pofile.untranslated_entries() + pofile.fuzzy_entries(), service, True)

def input_needed_translations(lang_code, pofile, pofile_path, service):
    prior_percent_translated = pofile.percent_translated()
    prior_num_needs_translations = len(pofile.untranslated_entries() + pofile.fuzzy_entries())
    translations = {}
    document = service.documents().get(documentId=HMN_DOCUMENT_ID).execute()
    table_rows = document['body']['content'][2]['table']['tableRows']
    for row in table_rows[1:]:
        doc_msgid = row['tableCells'][0]["content"][0]["paragraph"]["elements"][0]["textRun"]["content"]
        doc_msgstr = row['tableCells'][1]["content"][0]["paragraph"]["elements"][0]["textRun"]["content"]
        translations[doc_msgid.replace("\n", "")] = doc_msgstr.replace("\n", "")

    for entry in pofile.untranslated_entries() + pofile.fuzzy_entries():
        entry.msgstr = translations.get(entry.msgid, entry.msgstr)
    
    pofile.save(pofile_path)
    print("{difference} more translations added".format(difference=prior_num_needs_translations - len(pofile.untranslated_entries() + pofile.fuzzy_entries())))
    print("Percent translated went from: {prior}% to {current}%".format(prior=prior_percent_translated, current=pofile.percent_translated()))



#################### For Use with Text Files ##############################
def input_needed_translations_txt(lang_code, pofile, pofile_path):
    prior_percent_translated = pofile.percent_translated()
    translations = {}
    with open("{}_translations.txt".format(lang_code), "r") as transdoc:
        for line in transdoc:
            if line == "\n":
                continue
            translations.update((json.loads(line)))
    
    for entry in pofile.untranslated_entries() + pofile.fuzzy_entries():
        entry.msgstr = translations.get(entry.msgid, entry.msgstr)
    
    pofile.save(pofile_path)
    print("Percent translated went from: {prior}% to {current}%".format(prior=prior_percent_translated, current=pofile.percent_translated()))

def output_all_msgids_txt(lang_code, pofile):
    with open("{}_translations.txt".format(lang_code), 'w') as transdoc:
        for entry in pofile:
            json.dump({entry.msgid:entry.msgstr}, transdoc)
            transdoc.write("\n\n")

def output_needs_translation_txt(lang_code, pofile):
    with open("{}_needs_translation.txt".format(lang_code), 'w') as transdoc:
        for entry in pofile.untranslated_entries() + pofile.fuzzy_entries():
            json.dump({entry.msgid:""}, transdoc)
            transdoc.write("\n\n")

def find_fuzzy_entries(lang_code, pofile):
    return [entry.msgid for entry in pofile if entry.fuzzy]


def main(argv):
    DOCUMENT_ID = get_document_id(argv[1])
    # check_other_arguments(argv)
    creds = get_google_creds()
    service = build('docs', 'v1', credentials=creds)
    pofile_path = "./representable/<representable>locale/{}/LC_MESSAGES/django.po".format(argv[1])
    pofile = polib.pofile(pofile_path)

    # output_all_msgids(argv[1], pofile)
    # print(find_fuzzy_entries(argv[1], pofile))
    # output_untranslated_msgids(argv[1], pofile)
    # output_all_msgids_to_doc(argv[1], pofile, service)
    output_needs_translation(argv[1], pofile, service)
    # input_needed_translations(argv[1], pofile, pofile_path, service)

'''
    argv[1] : the language code
              hmn - Hmong, es - Spanish, ar - Arabic

    argv[2] : in - Input translations
              out - Output msgids to be translated

    argv[3] : scope of the function:
                0 - output or input translations for only the msgids that need translations (they are fuzzy or untranslated) 
                1 - output all msgids to be translated or input translations for all msgids
'''
if __name__ == "__main__":
    main(sys.argv)