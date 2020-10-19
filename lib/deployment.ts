import { Construct } from "constructs";
import { Deployment as DeploymentApiObject } from "../imports/k8s";
import { Container, ContainerOptions, Volume } from "./container";

export interface DeploymentOptions extends ContainerOptions {
  /**
   * Number of replicas to start.
   *
   * @default 1
   */
  readonly replicas?: number;

  /**
   * Secret volume mounts for deployment container.
   *
   * @default []
   */
  readonly secretMounts?: { name: string, mountPath: string, subPath: string }[]
}

export class Deployment extends Construct {
  constructor(scope: Construct, appname: string, options: DeploymentOptions) {
    super(scope, `deployment-${appname}`);

    const label = { name: appname };
    const replicas = options.replicas ?? 1;
    const containers: Container[] = [new Container(options)];
    const volumes: Volume[] | undefined = options.secretMounts?.map(m => new Volume(m))

    new DeploymentApiObject(this, `deployment-${appname}`, {
      metadata: {
        name: appname,
        namespace: 'default',
        labels: label
      },
      spec: {
        replicas: replicas,
        selector: {
          matchLabels: label,
        },
        strategy: {
          type: "RollingUpdate",
          rollingUpdate: {
            maxSurge: 3,
            maxUnavailable: 0,
          },
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: containers,
            volumes: volumes,
          },
        },
      },
    });
  }
}
