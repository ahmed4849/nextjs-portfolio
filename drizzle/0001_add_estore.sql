-- Custom SQL migration file, put your code below! --
INSERT OR IGNORE INTO projects (id,title,category,description,stack,url,theme,created_at)
VALUES ('estore','EStore','Business application · Full stack · In progress','Working on an EStore-based business application with an ASP.NET Core backend, an Angular frontend and SQL Server persistence. Focused on reusable application layers, authenticated APIs and a foundation for business workflows.','C#,ASP.NET Core,Angular,EF Core,SQL Server,MediatR','','form',0);
