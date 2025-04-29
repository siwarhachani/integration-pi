import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componnents/front_office/template/home/home.component';
import { HeaderBackComponent } from './componnents/back_office/template/header-back/header-back.component';
import { MealListComponent } from './componnents/front_office/meals/meal-list/meal-list.component';
import { MealDetailsComponent } from './componnents/front_office/meals/meal-details/meal-details.component';
import { IngredientComponent } from './componnents/front_office/meals/ingredient/ingredient.component';
import { MealIntakeComponent } from './componnents/front_office/meals/meal-intake/meal-intake.component';
import { IngredientCrudComponent } from './componnents/back_office/meals/ingredient-crud/ingredient-crud.component';
import { HomeBackComponent } from './componnents/back_office/template/home-back/home-back.component';
import { EatthismuchComponent } from './componnents/front_office/meals/eatthismuch/eatthismuch.component';
import { MealgenerateComponent } from './componnents/front_office/meals/mealgenerate/mealgenerate.component';
import { LoginComponent } from './componnents/front_office/user/authComponents/login/login.component';
import { guestGuard } from './guards/guest.guard';
import { RegisterComponent } from './componnents/front_office/user/authComponents/register/register.component';
import { ForgetpasswordComponent } from './componnents/front_office/user/authComponents/forgetpassword/forgetpassword.component';
import { ResetpasswordComponent } from './componnents/front_office/user/authComponents/resetpassword/resetpassword.component';

import { roleGuard } from './guards/role.guard';
import { NotAuthorizedComponent } from './componnents/front_office/user/authComponents/not-authorized/not-authorized.component';
import { ProfileUpdateComponent } from './componnents/front_office/user/user/profile-update/profile-update.component';
import { ProfileComponent } from './componnents/front_office/user/user/profile/profile.component';
import { AdminCrudJobOffersComponent } from './componnents/back_office/jobs/admin-crud-job-offers/admin-crud-job-offers.component';
import { AdminDashlistapplicationsComponent } from './componnents/back_office/jobs/admin-dashlistapplications/admin-dashlistapplications.component';
import { AdminStatsComponent } from './componnents/back_office/jobs/admin-stats/admin-stats.component';
import { ScheduleInterviewCandidateComponent } from './componnents/back_office/jobs/schedule-interview-candidate/schedule-interview-candidate.component';
import { ApplyJobComponent } from './componnents/front_office/jobs/apply-job/apply-job.component';
import { ListJobOffersComponent } from './componnents/front_office/jobs/list-job-offers/list-job-offers.component';
import { EventComponent } from './componnents/back_office/event/event/event.component';
import { EventCategoryComponent } from './componnents/back_office/event/EventCategory/event-category.component.spec';
import { EventMapComponent } from './componnents/front_office/event/event-map/event-map.component';
import { UserEventComponent } from './componnents/front_office/event/user-event/user-event.component';
import { FormComponent } from './componnents/back_office/form/form.component';
import { UserComponent } from './componnents/back_office/user/user.component';
import { AddPostComponent } from './componnents/front_office/posts/add-post/add-post.component';
import { MyPostsComponent } from './componnents/front_office/posts/my-posts/my-posts.component';
import { PostListComponent } from './componnents/front_office/posts/post-list/post-list.component';
import { PostPageComponent } from './componnents/front_office/posts/post-page/post-page.component';
import { CartComponent } from './componnents/front_office/shops/cart/cart.component';
import { ProductFormComponent } from './componnents/front_office/shops/product-form/product-form.component';
import { ProductListComponent } from './componnents/front_office/shops/product-list/product-list.component';
import { ProductStatsComponent } from './componnents/front_office/shops/product-stats/product-stats.component';
import { ProductUpdateComponent } from './componnents/front_office/shops/product-update/product-update.component';
import { OauthSuccessComponent } from './componnents/front_office/user/authComponents/oauth-success/oauth-success.component';
import { AdmincrudComponent } from './componnents/back_office/admincrud/admincrud.component';
import { AddEditActivitiesComponent } from './componnents/front_office/activities/AddEditActivities/AddEditActivities.component';
import { ExerciseGeneratorComponent } from './componnents/front_office/activities/exercise-generator/exercise-generator.component';
import { ListActivitiesComponent } from './componnents/front_office/activities/ListActivities/ListActivities.component';
import { ListTypeActivityComponent } from './componnents/front_office/activities/ListTypeActivity/ListTypeActivity/ListTypeActivity.component';
import { StatisticsComponent } from './componnents/front_office/activities/Statistics/statistics.component';

const routes: Routes = [
    
    {path : 'Back', component : HeaderBackComponent},
    {path : 'home', component : HomeComponent},
    { path: 'meal-list/:category', component: MealListComponent },
    { path: 'meal-details/:mealId', component: MealDetailsComponent },
    { path: 'ingredient', component: IngredientComponent },
    { path: 'intake',component:MealIntakeComponent  },
    { path: 'ingredient-crud', component: IngredientCrudComponent },
    { path: 'eat', component: EatthismuchComponent },
    { path: 'generate', component: MealgenerateComponent },

    {path:'listoffers',component:ListJobOffersComponent},
    { path: 'applyjob/:id/:title', component: ApplyJobComponent },
    {path:'admin/applications',component:AdminDashlistapplicationsComponent},
    {path:'admin/offers',component:AdminCrudJobOffersComponent},
    {path:'candidat/comfirm',component:ScheduleInterviewCandidateComponent},
    
    {path:'admin/stat',component:AdminStatsComponent},
  

    { path: 'event', component: EventComponent },
    { path: 'eventCategory', component: EventCategoryComponent },
    { path: 'user-events', component: UserEventComponent },
    { path: 'event-map/:id', component: EventMapComponent },
    { path: 'event-stats', loadComponent: () => import('./componnents/front_office/event/event-stats/event-stats.component').then(m => m.EventStatsComponent) },
  
    { path: 'admin-meeting/:id', loadComponent: () => import('./componnents/front_office/event/virtual-meeting/virtual-meeting.component').then(m => m.VirtualMeetingComponent) },
    { path: 'user-meeting/:id', loadComponent: () => import('./componnents/front_office/event/virtual-meeting/virtual-meeting.component').then(m => m.VirtualMeetingComponent) },
  
    {path : 'ListType', component : ListTypeActivityComponent},
    {path : 'ListActivity', component : ListActivitiesComponent},
    {path : 'statistics', component : StatisticsComponent},
    {path : 'add-edit', component: AddEditActivitiesComponent},
    {path : 'add-edit/:id', component: AddEditActivitiesComponent}, 
    {path : 'activities/details/:id', component: AddEditActivitiesComponent},
    {path : 'exercise-generator', component: ExerciseGeneratorComponent},
    {path : 'crudadmin', component: AdmincrudComponent},
  



    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
      path: 'login',
      component: LoginComponent,
      canActivate: [guestGuard]
    },
    {
      path: 'register',
      component: RegisterComponent,
      canActivate: [guestGuard]
    },
    { path: 'forgot-password', component: ForgetpasswordComponent },
    { path: 'reset-password', component: ResetpasswordComponent },
    {
      path: 'dashboard',
      component: HomeComponent,
      canActivate: [roleGuard],
      data: { role: 'USER' }
    },
    {
      path: 'userdashboard',
      component: UserComponent,
      canActivate: [roleGuard],
      data: { role: 'ADMIN' }
    },
    { path: 'not-authorized', component: NotAuthorizedComponent },
    { path: 'posts', component: PostListComponent },
    { path: 'posts/new', component: AddPostComponent },
    { path: 'post/:id', component: PostPageComponent },
    { path: 'my-posts', component: MyPostsComponent },
    { path: 'form-admin', component: FormComponent },
    { path: 'profile-update', component: ProfileUpdateComponent },
    { path: 'profile/:username', component: ProfileComponent },
    { path: 'oauth-success', component: OauthSuccessComponent },
    
    { path: 'not-authorized', component: NotAuthorizedComponent },
    { path: 'profile-update', component: ProfileUpdateComponent },
    { path: 'profile/:username', component: ProfileComponent },
    {path: 'product-form', component: ProductFormComponent },
    { path: 'product-update/:id', component: ProductUpdateComponent },  // Route pour la mise à jour d'un produit
    { path: 'product-list', component: ProductListComponent },
    { path: 'cart', component: CartComponent },
    { path: 'stats', component: ProductStatsComponent },
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
