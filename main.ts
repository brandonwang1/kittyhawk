import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';
import { buildChart } from "./values";

export class MyChart extends Chart {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    buildChart(this);
  }
}

const app = new App();
new MyChart(app, "kittyhawk");
app.synth();
