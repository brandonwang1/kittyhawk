import { Construct } from 'constructs';
import { Deployment, DeploymentOptions } from './deployment';
import { HostsConfig, Ingress, IngressOptions } from './ingress';
import { Service, ServiceOptions } from './service'
import { Certificate } from './certificate';

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


export interface DjangoApplicationOptions extends ApplicationOptions {
  /**
   * Domain of the application.
   */
  readonly domain: string;

  /**
   * Just the list of paths passed to the ingress since we already know the host.
   */
  readonly ingressPaths: string[];

  /**
   * Override extraEnv from ContainerOptions to make it mutable.
   */
  extraEnv?: { name: string, value: string }[];

  /**
   * Override ingress from IngressOptions to make it mutable.
   *
   * @default undefined
   */
  ingress?: HostsConfig;

}

export class DjangoApplication extends Application {
  constructor(scope: Construct, appname: string, options: DjangoApplicationOptions) {

    // Add the domain as an env variable.
    options.extraEnv = options.extraEnv || [];
    options.extraEnv.push({ name: 'DOMAIN', value: options.domain });

    // Configure the ingress using ingressPaths.
    options.ingress = {
      hosts: [{ host: options.domain, paths: options.ingressPaths }],
    }

    // Check if the env variables contains DOMAIN
    const envDomain = options.extraEnv?.filter(env => (env.name === 'DOMAIN'));
    if (envDomain?.length > 1) {
      throw new Error('Django Application should not redefine a DOMAIN enviroment variable.')
    }

    // Check if the env variables contains DJANGO_SETTINGS_MODULE
    const envSettingsModule = options.extraEnv?.filter(env => (env.name === 'DJANGO_SETTINGS_MODULE'));
    if (!envSettingsModule?.length) {
      throw new Error('Django Application must define a DJANGO_SETTINGS_MODULE enviroment variable.')
    }

    // If everything passes, construct the Application.
    super(scope, appname, options);
  }
}

export interface ReactApplicationOptions extends ApplicationOptions {
  /**
   * Domain of the application.
   */
  readonly domain: string;

  /**
   * Just the list of paths passed to the ingress since we already know the host.
   */
  readonly ingressPaths: string[];

  /**
   * Override extraEnv from ContainerOptions to make it mutable.
   */
  extraEnv?: { name: string, value: string }[];

  /**
   * Override ingress from IngressOptions to make it mutable.
   *
   * @default undefined
   */
  ingress?: HostsConfig;
}

export class ReactApplication extends Application {
  constructor(scope: Construct, appname: string, options: ReactApplicationOptions) {

    // Add the domain as an env variable.
    options.extraEnv = options.extraEnv || [];
    options.extraEnv.push({ name: 'DOMAIN', value: options.domain });

    // Configure the ingress using ingressPaths.
    options.ingress = {
      hosts: [{ host: options.domain, paths: options.ingressPaths }],
    }

    // Check if the env variables contains DOMAIN
    const envDomain = options.extraEnv?.filter(env => (env.name === 'DOMAIN'));
    if (envDomain?.length > 1) {
      throw new Error('React Application should not redefine a DOMAIN enviroment variable.')
    }

    // Check if the env variables contains PORT
    const envSettingsModule = options.extraEnv?.filter(env => (env.name === 'PORT'));
    if (!envSettingsModule?.length) {
      throw new Error('React Application must define a PORT enviroment variable.')
    }

    // If everything passes, construct the Application.
    super(scope, appname, options);
  }
}