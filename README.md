# Kittyhawk

Kittyhawk is the automated Kubernetes YAML synthesizer for Penn Labs (replacing Icarus).

## Getting Started
1. Write a configuration for your project in the [values.ts](./values.ts) file by changing the contents of the buildChart function. You can find a list of available classes in the [user guide](./USER_GUIDE.md). Sample configurations are provided in the values.ts and [values-test.ts](./values-test.ts) files.
2. Install the cdk8s CLI package globally:

    ```shell
    $ npm install -g cdk8s-cli
    ```
3. Compile and synthesize the Kubernetes YAML using the command below. It it saved at dist/kittyhawk.k8s.yaml. 

    ```shell
    $ npm run synth
    ```
4. Deploy the YAML (optionally using the --prune flag if needed).

    ```shell
    $ kubectl apply -f dist/kittyhawk.k8s.yaml
    ```

For more detailed information, check the [user guide](./USER_GUIDE.md).