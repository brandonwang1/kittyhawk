import { Construct } from 'constructs';
import { Deployment, DeploymentOptions } from "./deployment";
import { Ingress, IngressOptions } from "./ingress";
import { Service, ServiceOptions } from "./service"
import { Certificate } from "./certificate";

export interface ApplicationOptions extends IngressOptions, DeploymentOptions,
  ServiceOptions { }


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


export class DjangoApplication extends Application {
  constructor(scope: Construct, appname: string, options: ApplicationOptions) {

    // Check if the env variables contains DOMAIN
    const envDomain = options.extraEnv?.filter(env => (env.name === "DOMAIN"));
    if (envDomain?.length != 1) {
      throw new Error("Django Application must define a DOMAIN enviroment variable.")
    } else {
      // Check if ingress contains a host that matches DOMAIN.
      const ingressDomain = options.ingress?.hosts.filter(h => (h.host === envDomain[0].value))
      if (!ingressDomain?.length) {
        throw new Error("Ingress hosts must contain DOMAIN environment variable.")
      }
    }

    // Check if the env variables contains DJANGO_SETTINGS_MODULE
    const envSettingsModule = options.extraEnv?.filter(env => (env.name === "DJANGO_SETTINGS_MODULE"));
    if (!envSettingsModule?.length) {
      throw new Error("Django Application must define a DJANGO_SETTINGS_MODULE enviroment variable.")
    }

    // If everything passes, construct the Application.
    super(scope, appname, options);
  }
}

export class ReactApplication extends Application {
  constructor(scope: Construct, appname: string, options: ApplicationOptions) {

    // Check if the env variables contains DOMAIN
    const envDomain = options.extraEnv?.filter(env => (env.name === "DOMAIN"));
    if (envDomain?.length != 1) {
      throw new Error("React Application must define a DOMAIN enviroment variable.")
    } else {
      // Check if ingress contains a host that matches DOMAIN.
      const ingressDomain = options.ingress?.hosts.filter(h => (h.host === envDomain[0].value))
      if (!ingressDomain?.length) {
        throw new Error("Ingress hosts must contain DOMAIN environment variable.")
      }
    }

    // Check if the env variables contains PORT
    const envSettingsModule = options.extraEnv?.filter(env => (env.name === "PORT"));
    if (!envSettingsModule?.length) {
      throw new Error("React Application must define a PORT enviroment variable.")
    }

    // If everything passes, construct the Application.
    super(scope, appname, options);
  }
}