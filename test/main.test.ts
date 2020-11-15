import { Chart } from '../lib';
import { Testing } from 'cdk8s';
import { Construct } from 'constructs';
import { CronJob } from '../lib/cronjob';
import { Application, DjangoApplication, ReactApplication } from '../lib/application'


const release_name = 'RELEASE_NAME';

/** UNIT TEST CONFIGS */
export function buildProbeChart(scope: Construct) {

  /** Probe tests **/
  new Application(scope, `${release_name}-serve`, {
    image: 'pennlabs/website',
    tag: 'latest',
    readinessProbe: { path: '/', delay: 5 }, // Default on?
    livenessProbe: { command: ['test', 'command'], period: 5 },
  })
}

export function buildAutoscalingChart(scope: Construct) {

  /** Autoscaling test **/
  new Application(scope, `${release_name}-serve`, {
    image: 'pennlabs/website',
    autoScalingOptions: { cpu: 80, memory:80, requests:80 },
  })
}

export function buildFailingDjangoChart(scope: Construct) {

  /** Django Duplicated DOMAIN Env should fail **/
  new DjangoApplication(scope, `${release_name}-platform`, {
    image: 'pennlabs/platform',
    domain: 'platform.pennlabs.org',
    extraEnv: [ { name: 'DOMAIN', value: 'platform.pennlabs.org' },
      { name: 'DJANGO_SETTINGS_MODULE', value: 'Platform.settings.production' }],
    ingressPaths: ['/'],
  })
}

export function buildFailingReactChart(scope: Construct) {

  /** React Duplicated DOMAIN Env should fail **/
  new ReactApplication(scope, `${release_name}-react`, {
    image: 'pennlabs/penn-clubs-frontend',
    replicas: 2,
    domain: 'pennclubs.com',
    ingressPaths: ['/'],
    extraEnv: [ { name: 'DOMAIN', value: 'pennclubs.com' },
      { name: 'PORT', value: '80' }],
  })
}

export function buildFailingIngressChart(scope: Construct) {

  /** Incorrect ingress host string should fail**/
  new Application(scope, `${release_name}-serve`, {
    image: 'pennlabs/website',
    tag: 'latest',
    ingress: { hosts: [{ host: 'pennlabsorg', paths: ['/'] }] },
  })
}

export function buildFailingAutoscalingChart(scope: Construct) {

  /** Autoscaling cannot be defined with replicas, should fail. **/
  new Application(scope, `${release_name}-serve`, {
    image: 'pennlabs/website',
    tag: 'latest',
    replicas: 2,
    autoScalingOptions: { cpu: 80 },
  })
}

export function buildFailingProbeChart(scope: Construct) {

  /** Probes should fail if neither command or path is defined **/
  new Application(scope, `${release_name}-serve`, {
    image: 'pennlabs/website',
    tag: 'latest',
    readinessProbe: { delay: 5 }, 
    livenessProbe: { period: 5 },
  })
}

/** INTEGRATION TEST CONFIGS */

export function buildWebsiteChart(scope: Construct) {

  /** Penn Labs Website **/
  new Application(scope, `${release_name}-serve`, {
    image: 'pennlabs/website',
    tag: 'latest',
    ingress: { hosts: [{ host: 'pennlabs.org', paths: ['/'] }] },
  })
}

export function buildBasicsChart(scope: Construct) {

  /** Penn Basics **/
  new Application(scope, `${release_name}-react`, {
    image: 'pennlabs/penn-basics',
    tag: 'latest',
    secret: 'penn-basics',
    extraEnv: [{ name: 'PORT', value: '80' }],
    ingress: { hosts: [{ host: 'pennbasics.com', paths: ['/'] }] },
  })
}

export function buildOHQChart(scope: Construct) {

  /** OHQ (Part of it) **/
  new DjangoApplication(scope, `${release_name}-django-asgi`, {
    image: 'pennlabs/office-hours-queue-backend',
    tag: 'latest',
    secret: 'office-hours-queue',
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    domain: 'ohq.io',
    ingressPaths: ['/api/ws'],
    extraEnv: [
      { name: 'DJANGO_SETTINGS_MODULE', value: 'officehoursqueue.settings.production' },
      { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' }],
  })

  new CronJob(scope, `${release_name}-calculate-waits`, {
    schedule: '*/5 * * * *',
    image: 'pennlabs/office-hours-queue-backend',
    tag: 'latest',
    secret: 'office-hours-queue',
    cmd: ['python', 'manage.py', 'calculatewaittimes'],
  });

}

export function buildCoursesChart(scope: Construct) {

  /** Penn Courses (Part of it) **/
  new Application(scope, `${release_name}-backend`, {
    image: 'pennlabs/penn-courses-backend',
    tag: 'latest',
    secret: 'penn-courses',
    cmd: ['celery', 'worker', '-A', 'PennCourses', '-Q', 'alerts,celery', '-linfo'],
    replicas: 3,
    extraEnv: [{ name: 'PORT', value: '80' },
      { name: 'DJANGO_SETTINGS_MODULE', value: 'PennCourses.settings.production' }],
    ingress: {
      hosts: [
        { host: 'penncourseplan.com', paths: ['/api', '/admin', '/accounts', '/assets'] },
        { host: 'penncoursealert.com', paths: ['/api', '/admin', '/accounts', '/assets', '/webhook'] },
        { host: 'review.penncourses.org', paths: ['/api', '/admin', '/accounts', '/assets'] },
      ],
    },
  })
}

export function buildPlatformChart(scope: Construct) {

  /** Platform **/
  new DjangoApplication(scope, `${release_name}-platform`, {
    image: 'pennlabs/platform',
    tag: 'latest',
    secret: 'platform',
    port: 443,
    domain: 'platform.pennlabs.org',
    extraEnv: [
      { name: 'DJANGO_SETTINGS_MODULE', value: 'Platform.settings.production' }],
    ingressPaths: ['/'],
    secretMounts: [{ name: 'platform', subPath: 'SHIBBOLETH_CERT', mountPath: '/etc/shibboleth/sp-cert.pem' },
      { name: 'platform', subPath: 'SHIBBOLETH_KEY', mountPath: '/etc/shibboleth/sp-key.pem' }],
  })
}

export function buildClubsChart(scope: Construct) {

  /** Penn Clubs **/
  new DjangoApplication(scope, `${release_name}-django-asgi`, {
    image: 'pennlabs/penn-clubs-backend',
    tag: 'latest',
    secret: 'penn-clubs',
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    domain: 'pennclubs.com',
    ingressPaths: ['/api/ws'],
    extraEnv: [
      { name: 'DJANGO_SETTINGS_MODULE', value: 'pennclubs.settings.production' },
      { name: 'REDIS_HOST', value: 'penn-clubs-redis' }],
  })

  new ReactApplication(scope, `${release_name}-react`, {
    image: 'pennlabs/penn-clubs-frontend',
    tag: 'latest',
    replicas: 2,
    domain: 'pennclubs.com',
    ingressPaths: ['/'],
    extraEnv: [{ name: 'PORT', value: '80' }],
  })

}



/** Helper function to run each chart test */
const chartTest = (build: (scope: Construct) => void) => {
  const app = Testing.app();
  const chart = new Chart(app, 'kittyhawk', build, release_name);
  const results = Testing.synth(chart)
  expect(results).toMatchSnapshot();
}

/** Helper function to run each chart test */
const failingTest = (build: (scope: Construct) => void) => {
  const app = Testing.app();
  expect(() => {new Chart(app, 'kittyhawk', build, release_name)}).toThrowError();
}

describe('Unit Tests', () => {
  test('Autoscaling', () => chartTest(buildAutoscalingChart));
  
  test('Readiness/Liveliness Probes', () => chartTest(buildProbeChart));

  test('Django Application -- Failing', () => failingTest(buildFailingDjangoChart));
  
  test('React Application -- Failing', () => failingTest(buildFailingReactChart));

  test('Ingress Regex -- Failing', () => failingTest(buildFailingIngressChart));

  test('Autoscaling -- Failing', () => failingTest(buildFailingAutoscalingChart));

  test('Probes -- Failing', () => failingTest(buildFailingProbeChart));

});

describe('Integration Tests', () => {
  test('Penn Labs Website', () => chartTest(buildWebsiteChart));

  test('Penn Basics', () => chartTest(buildBasicsChart));

  test('OHQ', () => chartTest(buildOHQChart));

  test('Penn Courses', () => chartTest(buildCoursesChart));

  test('Platform API', () => chartTest(buildPlatformChart));

  test('Penn Clubs', () => chartTest(buildClubsChart));

});
