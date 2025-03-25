import type { SidebarGroup,BreadcrumbItems } from '../ui/types'

export const adminNavigation: SidebarGroup[] = [
  {
    title: "Home page",
    url: "/",
    items: [
      {
        title: "Home page",
        url: "/",
      },
   
    ],
  },
  {
    title: "Profile",
    url: "/profile",
    items: [
      {
        title: "Profile",
        url: "/profile",
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