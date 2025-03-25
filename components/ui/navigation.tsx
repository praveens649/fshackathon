import type { SidebarGroup,BreadcrumbItems } from '../ui/types'

export const adminNavigation: SidebarGroup[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
      },
   
    ],
  },
  {
    title: "Help Desk",
    url: "/help-desk",
    items: [
      {
        title: "Help Desk",
        url: "/help-desk",
      },
      {
        title:"Get Help",
        url:"/help-desk/create"
      }
   
    ],
  },
  {
    title: "Support",
    url: "/support",
    items: [
      {
        title: "Support",
        url: "/support",
      },
      
   
    ],
  },
  {
    title: "Groups",
    url: "/group",
    items: [
      {
        title: "view groups",
        url: "/group",
      },
    {
        title:"Add groups",
        url:"/group/create"
      }
    ],
  },
 
];

export const adminBreadcrumb:BreadcrumbItems['items'] = {
  '/':[{
    title:'Homepage',
    url:'/'
  }],
  '/profile':[{
    title:'Profile',
    url:'/profile'
  }],
  '/products':[{
    title:'Products',
    url:'/products'
  }],
  '/products/create':[{
    title:'Products',
    url:'/products'
  },{
    title:'Add Products',
    url:'/products/create'
  }],
  
}