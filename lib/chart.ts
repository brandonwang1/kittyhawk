import { Construct } from 'constructs';
import { App, Chart as ChartApiObject } from 'cdk8s';

export class Chart extends ChartApiObject {
  constructor(scope: Construct, name: string, chartBuilder: Function) {
    super(scope, name);
    chartBuilder(this);
  }
}

export function synth (chartBuilder: Function) {
  const app = new App();
  new Chart(app, "kittyhawk", chartBuilder);
  app.synth();
}