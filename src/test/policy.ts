// import 'mocha';
// import { expect } from 'chai';
// import * as jp from 'jsonpath';

// const Tag: string = `Policy`;

// describe(Tag, () => {
//   // let viewModel: MoviesViewModel;
//   // let movieDataServiceStub: Sinon.SinonSpy;
//   beforeEach(() => {
//     const tag: string = `${Tag}.beforeEach()`;
//     log(tag);
//     // sinon.stub(movieDataService, 'loadMovies').returns([new Movie('The Matrix', 1998, 5)]);
//     // movieDataServiceStub = sinon.spy(movieDataService, 'save');
//     // viewModel = new MoviesViewModel();
//   });

//   afterEach(() => {
//     const tag: string = `${Tag}.afterEach()`;
//     log(tag);
//     // sinon.restore(movieDataService.loadMovies);
//   });

//   it('should load movies', () => {
//     const tag: string = `${Tag}.should load movies`;
//     log(tag);

//     const information = {
//       username: 'user00001',
//       group: ['administrator', 'publisher']
//     };


//     // {
//     //         "category": "fiction",
//     //         "author": "Herman Melville",
//     //         "title": "Moby Dick",
//     //         "isbn": "0-553-21311-3",
//     //         "price": 8.99
//     //       }

//     // $.author 'Herman Melville'
//     // - description: An anonymous user can sign up
//     // - rule:
//     //   - effect: permit
//     //   - resource: '/resources/user'
//     //   - operation: 'RegisterUserOperation'
//     //   - role: 'unauthenticated'



//     const ofAge = {
//       effect: 'permit',
//       resource: '/products/alcohol',
//       condition: '$subject.age >= 18',
//     };

//     const self = {
//       effect: 'permit',
//       resource: '/shop/1',
//       action: 'delete',
//       condition: '$resource.owner == $subject.id',
//     };

//     const admin = {
//       effect: 'permit',
//       resource: '/admin',
//       action: 'get',
//       condition: '$subject.role == admin',
//     }

//     const self2 = {
//       effect: 'permit',
//       resource: '/resources/:$resource',
//       owner: '$subject',
//       action: ['POST', 'PUT', 'PATCH', 'DELETE']
//     }




//     // On load up parse all policies, create koa middleware (or express) on corresponding endpoints
//     // with a forEach.

//     // Ok, and if none matches (is this possible? /all?) do the NonApplicable
//     // BUT if there's more than one match AND combining algo is only one applicable,
//     // then have to return Indeterminate.
//     // Also, have to combine the result from the multiple matching policies?


//     // 6
//     // Policies and policy sets may take parameters that modify the behavior of the combining
//     // algorithms. 317 However, none of the standard combining algorithms is affected by parameters. 318
//     // Users of this specification may, if necessary, define their own combining algorithms.




//     // Rbac.evaluatePolicy(rule, dataRetriever.createChild(information), (err, result) => {

//     //   expect(err).to.not.exist();

//     //   expect(result).to.exist().and.to.equal(Rbac.PERMIT);

//     //   done();
//     // });
//   });
// });

// // {
// //   "store": {
// //     "book": [
// //       {
// //         "category": "reference",
// //         "author": "Nigel Rees",
// //         "title": "Sayings of the Century",
// //         "price": 8.95
// //       }, {
// //         "category": "fiction",
// //         "author": "Evelyn Waugh",
// //         "title": "Sword of Honour",
// //         "price": 12.99
// //       }, {
// //         "category": "fiction",
// //         "author": "Herman Melville",
// //         "title": "Moby Dick",
// //         "isbn": "0-553-21311-3",
// //         "price": 8.99
// //       }, {
// //          "category": "fiction",
// //         "author": "J. R. R. Tolkien",
// //         "title": "The Lord of the Rings",
// //         "isbn": "0-395-19395-8",
// //         "price": 22.99
// //       }
// //     ],
// //     "bicycle": {
// //       "color": "red",
// //       "price": 19.95
// //     }
// //   }
// // }