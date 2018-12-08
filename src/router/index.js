import Vue from 'vue'
import Router from 'vue-router'
import { config } from '@/config'

import AppLayout from '@/components/AppLayout'
import Home from '@/components/Home'

Vue.use(Router)

const router = new Router({
  routes: [

    {
      path: '/',
      name: '',
      component: AppLayout,

      children: [
        {
          path: '',
          name: 'Home',
          component: Home
        }
      ]

    }
  ]

})

export default router

