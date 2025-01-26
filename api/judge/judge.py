import sys
import pprint
import json

import pandas as pd


header = '''
from typing import List
'''


def main():
    # args: judge.py, problem id, problem code
    args = sys.argv

    problem_id = int(args[1])
    code = args[2]
    code = header + code

    df = pd.read_csv('./problem_test_cases.csv')
    problems = pd.read_csv('../assets/problems.csv')
    problem_function_name = problems[problems['id'] == problem_id]['problem_function'].iloc[0]

    # problem_function_name = problems[problems['title'] == problem_name]['problem_function'].iloc[0]
    test_cases = df[df['id'] == problem_id]

    results = {'passed': [], 'failed': []}

    for test_case in test_cases.iterrows():
        inp = test_case[1]['input']
        out = test_case[1]['output']
        final_code = code + '\n' + inp + '\n' + f'output = {problem_function_name}(*input)'
        context = {}
        print(final_code)
        exec(final_code, context)
        expected = out.strip().replace('\n', '').replace(' ', '').lower()
        output = str(context['output']).strip().replace('\n', '').replace(' ', '').lower()
        if expected == output:
            results['passed'].append({'input': inp, 'expected': expected, 'output': output})
        else:
            results['failed'].append({'input': inp, 'expected': expected, 'output': output})

    print(json.dumps(results))


if __name__ == '__main__':
    main()
