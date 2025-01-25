import sys
import pprint

import pandas as pd


header = '''
from typing import List
'''


def main():
    # args: judge.py, problem id, problem code
    args = sys.argv

    # problem_name = 'Two Sum'
    problem_id = int(args[1])

    # code is a function
#     code = '''
# def TwoSum(nums: List[int], target: int) -> List[int]:
#     n = len(nums)
#     for i in range(n - 1):
#         for j in range(i + 1, n):
#             if nums[i] + nums[j] == target:
#                 return [i, j]
#     return [-1, -1]
#     '''
    code = args[2]
    code = header + code

    df = pd.read_csv('problem_test_cases.csv')
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
        exec(final_code, context)

        if out == str(context['output']):
            results['passed'].append({'input': inp, 'expected': out, 'output': context['output']})
        else:
            results['failed'].append({'input': inp, 'expected': out, 'output': context['output']})

    pprint.pprint(results)


if __name__ == '__main__':
    main()
