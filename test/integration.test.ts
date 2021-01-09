import { Construct } from 'constructs';
import { CronJob } from '../lib/cronjob';
import { Application, DjangoApplication, ReactApplication } from '../lib/application'
import { chartTest } from './utils'
import cronTime from 'cron-time-generator';

/** INTEGRATION TEST CONFIGS */

export function buildWebsiteChart(scope: Construct) {

  /** Penn Labs Website **/
  new Application(scope, 'serve', {
    image: 'pennlabs/website',
    ingress: [{ host: 'pennlabs.org', paths: ['/'] }],
  })
}

export function buildBasicsChart(scope: Construct) {

  /** Penn Basics **/
  new Application(scope, 'react', {
    image: 'pennlabs/penn-basics',
    secret: 'penn-basics',
    extraEnv: [{ name: 'PORT', value: '80' }],
    ingress: [{ host: 'pennbasics.com', paths: ['/'] }],
  })
}

export function buildOHQChart(scope: Construct) {

  /** OHQ (Part of it) **/
  new DjangoApplication(scope, 'django-asgi', {
    image: 'pennlabs/office-hours-queue-backend',
    secret: 'office-hours-queue',
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    domain: 'ohq.io',
    ingressPaths: ['/api/ws'],
    djangoSettingsModule: 'officehoursqueue.settings.production',
    extraEnv: [
      { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' }],
  })

  new CronJob(scope, 'calculate-waits', {
    schedule: cronTime.every(5).minutes(),
    image: 'pennlabs/office-hours-queue-backend',
    secret: 'office-hours-queue',
    cmd: ['python', 'manage.py', 'calculatewaittimes'],
  });

}

export function buildCoursesChart(scope: Construct) {

  /** Penn Courses (Part of it) **/
  new Application(scope, 'backend', {
    image: 'pennlabs/penn-courses-backend',
    secret: 'penn-courses',
    cmd: ['celery', 'worker', '-A', 'PennCourses', '-Q', 'alerts,celery', '-linfo'],
    replicas: 3,
    extraEnv: [{ name: 'PORT', value: '80' },
      { name: 'DJANGO_SETTINGS_MODULE', value: 'PennCourses.settings.production' }],
    ingress: [
      { host: 'penncourseplan.com', paths: ['/api', '/admin', '/accounts', '/assets'] },
      { host: 'penncoursealert.com', paths: ['/api', '/admin', '/accounts', '/assets', '/webhook'] },
      { host: 'review.penncourses.org', paths: ['/api', '/admin', '/accounts', '/assets'] },
    ],
  })
}

export function buildPlatformChart(scope: Construct) {

  /** Platform **/
  new DjangoApplication(scope, 'platform', {
    image: 'pennlabs/platform',
    secret: 'platform',
    port: 443,
    domain: 'platform.pennlabs.org',
    djangoSettingsModule: 'Platform.settings.production',
    ingressPaths: ['/'],
    secretMounts: [{ name: 'platform', subPath: 'SHIBBOLETH_CERT', mountPath: '/etc/shibboleth/sp-cert.pem' },
      { name: 'platform', subPath: 'SHIBBOLETH_KEY', mountPath: '/etc/shibboleth/sp-key.pem' }],
  })
}

export function buildClubsChart(scope: Construct) {

  /** Penn Clubs **/
  new DjangoApplication(scope, 'django-asgi', {
    image: 'pennlabs/penn-clubs-backend',
    secret: 'penn-clubs',
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    domain: 'pennclubs.com',
    ingressPaths: ['/api/ws'],
    djangoSettingsModule: 'pennclubs.settings.production',
    extraEnv: [
      { name: 'REDIS_HOST', value: 'penn-clubs-redis' }],
  })

  new ReactApplication(scope, 'react', {
    image: 'pennlabs/penn-clubs-frontend',
    replicas: 2,
    domain: 'pennclubs.com',
    ingressPaths: ['/'],
    extraEnv: [{ name: 'PORT', value: '80' }],
  })

}


test('Penn Labs Website', () => chartTest(buildWebsiteChart));
test('Penn Basics', () => chartTest(buildBasicsChart));
test('OHQ', () => chartTest(buildOHQChart));
test('Penn Courses', () => chartTest(buildCoursesChart));
test('Platform API', () => chartTest(buildPlatformChart));
test('Penn Clubs', () => chartTest(buildClubsChart));

