import { Construct } from 'constructs';
import { Deployment as DeploymentApiObject } from '../imports/k8s';
import { Autoscaler, AutoscalingOptions } from './autoscaler';
import { Container, ContainerOptions, Volume } from './container';

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

  /**
   * Options for autoscaling. 
   * @default - see default autoscaler options
   */
  readonly autoScalingOptions?: AutoscalingOptions;

}

export class Deployment extends Construct {
  constructor(scope: Construct, appname: string, options: DeploymentOptions) {
    super(scope, `deployment-${appname}`);

    const label = { name: appname };
    const containers: Container[] = [new Container(options)];
    const volumes: Volume[] | undefined = options.secretMounts?.map(m => new Volume(m))
    const autoScalingOn : boolean = options.autoScalingOptions !== undefined

    if (autoScalingOn && options.replicas !== undefined) {
      throw new Error('Cannot specify "replicaCount" when auto-scaling is enabled');
    }

    const deployment = new DeploymentApiObject(this, `deployment-${appname}`, {
      metadata: {
        name: appname,
        namespace: 'default',
        labels: label,
      },
      spec: {
        replicas: autoScalingOn ? undefined : (options.replicas ?? 1),
        selector: {
          matchLabels: label,
        },
        strategy: {
          type: 'RollingUpdate',
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

    if (autoScalingOn) {
      new Autoscaler(this, appname, {
        target: deployment,
        ...options.autoScalingOptions,
      });
    }
  }
}
