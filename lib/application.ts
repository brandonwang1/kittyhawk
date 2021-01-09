import { Construct } from 'constructs';
import { Deployment, DeploymentProps } from './deployment';
import { Ingress, IngressProps } from './ingress';
import { Service, ServiceProps } from './service'
import { Certificate } from './certificate';

/**
 * Warning: Before editing any interfaces, make sure that none of the interfaces will have 
 * property names that conflict with each other. Typescript may not throw an error and it 
 * could cause problems.
 */
export interface ApplicationProps extends IngressProps, DeploymentProps,
  ServiceProps { }


export class Application extends Construct {
  constructor(scope: Construct, appname: string, props: ApplicationProps) {
    super(scope, appname);

    // We want to prepend the project name to the name of each component
    const release_name = process.env.RELEASE_NAME || 'undefined_release';
    const fullname = `${release_name}-${appname}`

    new Service(this, fullname, props);

    new Deployment(this, fullname, props);

    if (props.ingress) {
      new Ingress(this, fullname, props)

      new Certificate(this, fullname, props)
    }
  }
}


export interface DjangoApplicationProps extends ApplicationProps {
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
     * A list of host rules used to configure the Ingress.
     *
     * @default undefined
     */
  ingress?: { host: string, paths: string[] }[];
}

export class DjangoApplication extends Application {
  constructor(scope: Construct, appname: string, props: DjangoApplicationProps) {

    // Add the domain as an env variable.
    props.extraEnv = props.extraEnv || [];
    props.extraEnv.push({ name: 'DOMAIN', value: props.domain });

    // Configure the ingress using ingressPaths.
    props.ingress = [{ host: props.domain, paths: props.ingressPaths }]


    // Check if the env variables contains DOMAIN
    const envDomain = props.extraEnv?.filter(env => (env.name === 'DOMAIN'));
    if (envDomain?.length > 1) {
      throw new Error('Django Application should not redefine a DOMAIN enviroment variable.')
    }

    // Check if the env variables contains DJANGO_SETTINGS_MODULE
    const envSettingsModule = props.extraEnv?.filter(env => (env.name === 'DJANGO_SETTINGS_MODULE'));
    if (!envSettingsModule?.length) {
      throw new Error('Django Application must define a DJANGO_SETTINGS_MODULE enviroment variable.')
    }

    // If everything passes, construct the Application.
    super(scope, appname, props);
  }
}

export interface ReactApplicationProps extends ApplicationProps {
  /**
   * Domain of the application.
   */
  readonly domain: string;

  /**
   * Just the list of paths passed to the ingress since we already know the host.
   */
  readonly ingressPaths: string[];

  /**
   * Override extraEnv from ContainerProps to make it mutable.
   */
  extraEnv?: { name: string, value: string }[];

  /**
     * A list of host rules used to configure the Ingress.
     *
     * @default undefined
     */
  ingress?: { host: string, paths: string[] }[];
}

export class ReactApplication extends Application {
  constructor(scope: Construct, appname: string, props: ReactApplicationProps) {

    // Add the domain as an env variable.
    props.extraEnv = props.extraEnv || [];
    props.extraEnv.push({ name: 'DOMAIN', value: props.domain });

    // Configure the ingress using ingressPaths.
    props.ingress = [{ host: props.domain, paths: props.ingressPaths }]

    // Check if the env variables contains DOMAIN
    const envDomain = props.extraEnv?.filter(env => (env.name === 'DOMAIN'));
    if (envDomain?.length > 1) {
      throw new Error('React Application should not redefine a DOMAIN enviroment variable.')
    }

    // Check if the env variables contains PORT
    const envSettingsModule = props.extraEnv?.filter(env => (env.name === 'PORT'));
    if (!envSettingsModule?.length) {
      throw new Error('React Application must define a PORT enviroment variable.')
    }

    // If everything passes, construct the Application.
    super(scope, appname, props);
  }
}