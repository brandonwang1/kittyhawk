import { Construct } from 'constructs';
import { Deployment, DeploymentOptions } from "./deployment";
import { Ingress, IngressOptions } from "./ingress";
import { Service, ServiceOptions } from "./service"
import { Certificate } from "./certificate";

export interface ApplicationOptions extends IngressOptions, DeploymentOptions,
  ServiceOptions {}


export class Application extends Construct { 
  constructor(scope: Construct, appname: string, options: ApplicationOptions) {
    super(scope, appname);

    new Service(this, appname, options);

    new Deployment(this, appname, options);

    if (options.ingress) {
      new Ingress(this, appname, options)

      new Certificate(this, appname, options)
    }
  }
}
