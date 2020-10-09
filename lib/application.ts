import { Construct } from 'constructs';
import { Deployment, DeploymentOptions } from "./deployment";
import { Ingress, IngressOptions } from "./ingress";
import { Service, ServiceOptions } from "./service"
import { Certificate, CertificateOptions } from "./certificate";

export interface ApplicationOptions extends IngressOptions, DeploymentOptions,
  ServiceOptions, CertificateOptions {

  /**
  * The name of the application.
  */
  readonly name: string;

}


export class Application extends Construct {
  constructor(scope: Construct, appname: string, options: ApplicationOptions) {
    super(scope, appname);

    const name = options.name;
    const ingress = options.ingress;

    new Service(this, appname, `service-${name}`, options);

    new Deployment(this, appname, `deployment-${name}`, options);

    if (ingress !== undefined) {
      new Ingress(this, appname, `ingress-${name}`, options)

      new Certificate(this, appname, `certificate-${name}`, options)
    }
  }
}
