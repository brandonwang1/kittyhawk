import {MyChart} from './main';
import {Testing} from 'cdk8s';
import { values } from './values';

describe('Placeholder', () => {
  test('Empty', () => {
    const app = Testing.app();
    const chart = new MyChart(app, 'test-chart', values);
    const results = Testing.synth(chart)
    expect(results).toMatchSnapshot();
  });
});
