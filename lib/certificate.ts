import { Construct } from 'constructs';
import { Certificate as CertApiObject } from "../imports/cert-manager.io/certificate";


export interface CertificateOptions {

  /**
    * The name of the application.
    */
  readonly name: string;

}


export class Certificate extends Construct {
  constructor(scope: Construct, appname: string, id: string, options: CertificateOptions) {
    super(scope, id);

    new CertApiObject(this, id, {
      spec: {
        secretName: 'abc-tls',
        dnsNames: [''],
        issuerRef: {
          name: "wildcard-letsencrypt-prod",
          kind: 'ClusterIssuer',
          group: 'cert-manager.io'
        }
      }
    });

  }
}