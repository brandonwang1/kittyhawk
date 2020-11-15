import { Construct } from 'constructs';
import { App, Chart as ChartApiObject } from 'cdk8s';

export class Chart extends ChartApiObject {
  constructor(scope: Construct, name: string, chartBuilder: (scope: Construct) => void, release: string) {
    super(scope, name, {labels : {release}});
    chartBuilder(this);
  }
}

export function synth (chartBuilder: (scope: Construct) => void, release: string) {
  const app = new App();
  new Chart(app, 'kittyhawk', chartBuilder, release);
  app.synth();
}