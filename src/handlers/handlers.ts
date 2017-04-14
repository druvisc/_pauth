import { Effect } from './constants';

export const createHandler = (handler: Function/* name: string, */): Function => {

  // Retrieve subject and resource from context (?) and pass to the handler.
  const subject = {};
  const resource = {};

  // Act upon on the returned value from the handler.
  return handler(subject, resource);
}




// public void ConfigureServices(IServiceCollection services)
// {
//     services.AddAuthorization(options =>
//     {
//         options.AddPolicy("AdministratorOnly", policy => policy.RequireRole("Administrator"));
//         options.AddPolicy("EmployeeId", policy => policy.RequireClaim("EmployeeId", "123", "456"));
//         options.AddPolicy("Over21Only", policy => policy.Requirements.Add(new MinimumAgeRequirement(21)));
//     });
// }

// Combining algorithm?
// Rules and policies can be mix-matched into policies and policy sets.

interface User {
  name: string;
  age: number;
}

interface Beverage {
  name: string
  abv: number;
}

const DrinkingAge: number = 18;

const ageRequirement: Function = createHandler((subject: User, resource: Beverage) => {
  if (resource.abv > 0 && subject.age < DrinkingAge) return Effect.Deny;
  return Effect.Permit;
});


// How will the system be used? In .NET Core there's Program.cs and Startup.cs. Can write own code there.