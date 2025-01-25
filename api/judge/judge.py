import sys

import pandas as pd


header = '''
from typing import List
'''


def main():
    # args: judge.py, problem name, problem code
    args = sys.argv

    problem_name = 'Two Sum'

    # code is a function
    code = '''
def TwoSum(nums: List[int], target: int) -> List[int]:
    n = len(nums)
    for i in range(n - 1):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return [-1, -1]
    '''

    code = header + code

    df = pd.read_csv('problem_test_cases.csv')
    problems = pd.read_csv('../assets/problems_with_html.csv')

    problem_function_name = problems[problems['title'] == problem_name]['problem_function'].iloc[0]
    test_cases = df[df['problem'] == problem_name]

    for test_case in test_cases.iterrows():
        inp = test_case[1]['input']
        out = test_case[1]['output']
        final_code = code + '\n' + inp + '\n' + f'output = {problem_function_name}(*input)'
        context = {}
        exec(final_code, context)
        print(out, context['output'])
        if out == str(context['output']):
            print('passed')
        else:
            print('failed')

if __name__ == '__main__':
    main()
