import sys
import polib
import json

def input_untranslated_fuzzy(lang_code, pofile, pofile_path):
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

def output_all_msgids(lang_code, pofile):
    with open("{}_translations.txt".format(lang_code), 'w') as transdoc:
        for entry in pofile:
            json.dump({entry.msgid:entry.msgstr}, transdoc)
            transdoc.write("\n\n")

def find_fuzzy_entries(lang_code, pofile):
    return [entry.msgid for entry in pofile if entry.fuzzy]


def main(argv):
    pofile_path = "./representable/<representable>locale/{}/LC_MESSAGES/django.po".format(argv[1])
    pofile = polib.pofile(pofile_path)
    output_all_msgids(argv[1], pofile)
    # print(find_fuzzy_entries(argv[1], pofile))
    # input_untranslated_fuzzy(argv[1], pofile, pofile_path)

'''
    argv[1] : the language code (hmn, es, ar)
    argv[2] : input translation (in) or output phrases to be translated (out)
    argv[3] : scope of the function:
                all - output all msgids to be translated or input translations for all msgids
                untr_fuzz - output all msgids that are untranslated or fuzzy
'''
if __name__ == "__main__":
    main(sys.argv)