import {MyChart} from './main';
import {Testing} from 'cdk8s';

// Add tests for each of the existing products and each component
describe('Build Chart 2', () => {
  test('Empty', () => {
    const app = Testing.app();
    const chart = new MyChart(app, 'test-chart');
    const results = Testing.synth(chart)
    expect(results).toMatchSnapshot();
  });
});
