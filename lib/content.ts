export type Profile = {
  name: string;
  role: string;
  headline: string;
  bio: string;
  email: string;
  github: string;
  linkedin: string;
  skills: string;
  available: boolean;
};
export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  stack: string;
  url: string;
  theme: string;
};
export const defaultProfile: Profile = {
  name: "Muhammad Ahmad",
  role: ".NET Full Stack Developer",
  headline: "Reliable APIs.\nThoughtful web experiences.",
  bio: "I’m a .NET Full Stack Developer based in Faisalabad, Pakistan, with over a year of experience building REST APIs and web applications using C#, ASP.NET Core, Entity Framework Core, SQL Server, and Angular.\n\nMy work includes JWT authentication, role-based authorization, Clean Architecture, and business logic for HR, payroll, leave, and time-tracking systems. I also explore Generative AI, prompt engineering, and agentic workflows with n8n.",
  email: "ahmed.asif4849@gmail.com",
  github: "https://github.com/ahmed4849",
  linkedin: "https://www.linkedin.com/in/m-ahmed-4849as",
  skills:
    "C# & .NET 8,ASP.NET Core Web API,Entity Framework Core & LINQ,Angular & TypeScript,SQL Server & MySQL,JWT & Role-Based Authorization,Clean Architecture,HTML / CSS / Bootstrap / Tailwind,Three.js,Git / Swagger / Postman,Generative AI & n8n",
  available: true,
};

export const background = {
  location: "Faisalabad, Pakistan",
  phone: "+92 314 7809083",
  experience: [
    {
      role: "Full Stack Developer (.NET & Angular)",
      company: "Encodal",
      period: "1 year · 3 months internship + 9 months full-time",
      description:
        "Developed REST APIs and responsive Angular 19 pages, implemented authentication and authorization, designed SQL Server databases, and applied Clean Architecture. Documented APIs with Swagger and collaborated using Git and GitHub.",
    },
    {
      role: "Software Developer Intern",
      company: "NTRC, Faisalabad",
      period: "August 2025–present",
      description: "Software development internship.",
    },
  ],
  education: [
    {
      title: "Bachelor of Science in Computer Science",
      institution: "GC University Faisalabad",
      period: "2022–2025",
    },
    {
      title: "Intermediate",
      institution: "KIPS College, Jail Road, Faisalabad",
      period: "2019–2021",
    },
  ],
  certifications: [
    "Introduction to AI Agents and Agentic AI — 365 DataScience",
    "Introduction to Generative AI Studio — Simplilearn & Google",
    "Introduction to Generative AI — Simplilearn",
    "Introduction to AI — 365 DataScience",
    "Startup School: Prompt to Prototype",
  ],
  languages: "English, Urdu",
};
export const sampleProjects: Project[] = [
  {
    id: "estore",
    title: "EStore",
    category: "Business application · Full stack · In progress",
    description:
      "Working on an EStore-based business application with an ASP.NET Core backend, an Angular frontend and SQL Server persistence. Focused on reusable application layers, authenticated APIs and a foundation for business workflows.",
    stack: "C#,ASP.NET Core,Angular,EF Core,SQL Server,MediatR",
    url: "",
    theme: "form",
  },
  {
    id: "techlogx",
    title: "TechLogX",
    category: "HR & workforce management · In progress",
    description:
      "Developing the backend and Angular frontend for an HR and workforce management platform, including payroll, leave, time-tracking logic, and database design.",
    stack: ".NET 8,ASP.NET Core,EF Core,Angular,MySQL,SQL Server",
    url: "",
    theme: "orbit",
  },
  {
    id: "employee-management",
    title: "Employee Management System",
    category: "Business application · Backend",
    description:
      "Built a backend for employees, projects, and timesheets with JWT authentication and role-based access control. Modeled employee–project relationships with a custom join entity and implemented a draft, submission, and approval/rejection timesheet workflow.",
    stack: "ASP.NET Core,EF Core,SQL Server,JWT,Swagger",
    url: "",
    theme: "orbit",
  },
  {
    id: "ecommerce",
    title: "E-commerce Web Application",
    category: "E-commerce · Web application",
    description:
      "Developed APIs for product catalogs, carts, orders, and order tracking with JWT authentication and role-based authorization. Designed the relational database and built responsive product and cart pages.",
    stack: "ASP.NET Core,EF Core,SQL Server,JWT,AutoMapper,Bootstrap",
    url: "",
    theme: "form",
  },
  {
    id: "xprice",
    title: "XPrice",
    category: "Multi-store price comparison · Frontend",
    description:
      "Built an Angular price comparison application that highlights the lowest price across stores with dynamic currency formatting. Used reusable components, dependency injection, observables, and a ProductService.",
    stack: "Angular 19,TypeScript,Observables",
    url: "",
    theme: "form",
  },
  {
    id: "bookstore-api",
    title: "BookStore API",
    category: "REST API · Backend",
    description:
      "Built a REST API with custom filters for authorization, API-key authentication, exception handling, logging, and response wrapping. Configured Swagger/OpenAPI with API-key authentication.",
    stack: "ASP.NET Core,EF Core,SQL Server,Swagger",
    url: "",
    theme: "orbit",
  },
  {
    id: "ordering-system",
    title: "Ordering System APIs",
    category: "Order management · Full stack",
    description:
      "Built APIs for customers, products, orders, and order details using DTOs and AutoMapper, and integrated Angular pages with the backend.",
    stack: "ASP.NET Core,EF Core,SQL Server,AutoMapper,Angular",
    url: "",
    theme: "orbit",
  },
  {
    id: "country-api",
    title: "Country API",
    category: "REST API · Backend",
    description:
      "Implemented CRUD operations and file uploads stored in wwwroot, using DTOs and AutoMapper profiles.",
    stack: "ASP.NET Core,EF Core,SQL Server,AutoMapper",
    url: "",
    theme: "form",
  },
  {
    id: "interactive-portfolio",
    title: "3D Interactive Portfolio",
    category: "Interactive experience · Frontend",
    description:
      "Built and deployed a responsive 3D portfolio showcasing full-stack projects.",
    stack: "Angular,Three.js,Tailwind CSS,Vercel",
    url: "https://portfolio-angularopal.vercel.app",
    theme: "form",
  },
];
