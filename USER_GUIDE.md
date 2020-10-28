# User Guide (Under Construction)

The latest documentation can be found [here.](https://pennlabs.github.io/kittyhawk/index.html)

## Available Classes

- [Application](lib/application.ts) - the base class for deploying a general application, containing a deployment, service, and optionally an ingress and certificate. To create an Application, it must be passed a scope, name and an object containing a valid configuration. It's subclassed into ReactApplication and DjangoApplication, which have additional checks to make sure the configuration is correct.

- [Cronjob](lib/cronjob.ts) - the class for deploying a cronjob. To create an cronjob, it must be passed a scope, name and an object containing a valid configuration. 