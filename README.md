# Kittyhawk

Kittyhawk is the automated Kubernetes YAML generator for Penn Labs. 
With Kittyhawk, you can define an application's deployment configuration in Typescript by calling [constructs](https://cdk8s.io/docs/v1.0.0-beta.3/concepts/constructs/).

## Getting Started

The easiest way to get started is by creating a `k8s` folder in your project, and cloning the [Kittyhawk template](https://github.com/pennlabs/kittyhawk-template) inside. 

Afterwards, you can write your configuration. 

```
import { Application, synth } from '@pennlabs/kittyhawk';
import { Construct } from 'constructs'; 

const release_name = process.env.RELEASE_NAME || "undefined_release";
const image_tag = process.env.IMAGE_TAG || "latest";

export function buildChart(scope: Construct) {

  // 2048 Game configuration
  new Application(scope, `${release_name}-tfegame`, {
      image: 'alexwhen/docker-2048',
      port: 80,
      ingress: { hosts: [{ host: 'tfegame.pennlabs.org', paths: ['/'] }] },

  });

}

// Synthesizes the chart (run "npm run build")
synth(buildChart, release_name);

```

NOTE: If you are using Circle CI the following steps will be automatically done for you when you push to the master branch, and xxxx will run when you push to any other branch.

Next, run `yarn run synth` to synthesize your configuration. It will be saved to the directory `k8s/dist/kittyhawk.k8s.yaml`.


## Available Constructs

You can find the full API reference [here:](https://pennlabs.github.io/kittyhawk/index.html) 

- [Application](lib/application.ts) - the base class for deploying a general application, containing a deployment, service, and optionally an ingress and certificate. To create an Application, it must be passed a scope, name and a properties object containing a valid configuration. 
    -- ReactApplication and DjangoApplication are its two subclasses, which have additional checks to make sure the configuration is correct.

- [Cronjob](lib/cronjob.ts) - the class for deploying a cronjob. To create an cronjob, it must be passed a scope, name and a properties object containing a valid configuration. 