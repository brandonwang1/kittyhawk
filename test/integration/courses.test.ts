import { Construct } from 'constructs';
import { Application } from '../../src/application'
import { chartTest } from '../utils'

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

test('Penn Courses', () => chartTest(buildCoursesChart));
