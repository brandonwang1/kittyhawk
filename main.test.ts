import { MyChart } from './main';
import { Testing } from 'cdk8s';
import * as cht from './values-test';

const chartTest = (build: Function) => {
  const app = Testing.app();
  const chart = new MyChart(app, 'kittyhawk', build);
  const results = Testing.synth(chart)
  expect(results).toMatchSnapshot();
}

describe('Unit Tests', () => {
  test('Autoscaling', () => chartTest(cht.buildAutoscalingChart));
  
  test('Readiness/Liveliness Probes', () => chartTest(cht.buildProbeChart));
});

describe('Integration Tests', () => {
  test('Penn Labs Website', () => chartTest(cht.buildWebsiteChart));

  test('Penn Basics', () => chartTest(cht.buildBasicsChart));

  test('OHQ', () => chartTest(cht.buildOHQChart));

  test('Penn Courses', () => chartTest(cht.buildCoursesChart));

  test('Platform API', () => chartTest(cht.buildPlatformChart));

  test('Penn Clubs', () => chartTest(cht.buildClubsChart));

});
