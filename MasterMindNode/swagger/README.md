# Swagger Spec and Doc Viewer

Check out [swagger.io](http://swagger.io) for more details about swagger. 

## Viewing Spec - Standalone

To view the spec via the nice swagger-ui and without running the rest of the server: in the `MasterMindNode` directory, run `grunt swagger`. A web browser will open to [http://localhost:9001/docs/?url=http://localhost:9001/spec.json](http://localhost:9001/docs/?url=http://localhost:9001/spec.json). 

## Viewing Spec - Live

To view the spec from a running instance of `MasterMindNode`, visit [http://localhost:3000/swagger/docs](http://localhost:3000/swagger/docs).

## Using the Spec

Given a complete Swagger spec, the [javascript library](https://github.com/swagger-api/swagger-js) can provide a generated library for interacting with a server. There are also [code generation](https://github.com/swagger-api/swagger-codegen) tools for other non-javascript implementations.

The URL for the spec on a live `MasterMindNode` instance is [http://localhost:3000/swagger/spec.json](http://localhost:3000/swagger/spec.json).

## Specification Coverage

The spec has been started with an intitial structure that appears complete (it has at least something for each data model). However, this is inaccurate; most of these are placeholders. Check this table for the state of the spec:

| Type | Model | Spec Complete? | Implementation Complete? |
|------|-------|----------------|--------------------------|
| Definition | Assignment | :white_check_mark: | n/a |
| Definition | Configuration | :white_check_mark: | n/a |
| Definition | Department | :white_check_mark: | n/a |
| Definition | DepartmentCategory | :white_check_mark: | n/a |
| Definition | Hours | :white_check_mark: | n/a |
| Definition | Link | :white_check_mark: | n/a |
| Definition | Notification | :white_check_mark: | n/a |
| Definition | Person | :white_check_mark: | n/a |
| Definition | Project | :white_check_mark: | n/a |
| Definition | ProjectRole | :white_check_mark: | n/a |
| Definition | ReportFavorite | :white_check_mark: | n/a |
| Definition | Role | :white_check_mark: | n/a |
| Definition | SecurityRole | :white_check_mark: | n/a |
| Definition | Skill | :white_check_mark: | n/a |
| Definition | Task | :white_check_mark: | n/a |
| Definition | UserRole | :white_check_mark: | n/a |
| Definition | Vacation | :white_check_mark: | n/a |
| Definition | Error | :white_check_mark: | n/a |
| Paths | /assignments | :x: | :x: |
| Paths | /configurations | :x: | :x: |
| Paths | /department | :x: | :x: |
| Paths | /departmentCategories | :x: | :x: |
| Paths | /hours | :white_check_mark: | :x: |
| Paths | /hours/{id} | :white_check_mark: | :x: |
| Paths | /links | :x: | :x: |
| Paths | /notifications | :x: | :x: |
| Paths | /people | :x: | :x: |
| Paths | /projects | :white_check_mark: | :x: |
| Paths | /projects/{id} | :white_check_mark: | :x: |
| Paths | /projectRoles | :x: | :x: |
| Paths | /reportFavorites | :x: | :x: |
| Paths | /roles | :x: | :x: |
| Paths | /securityRoles | :x: | :x: |
| Paths | /skills | :x: | :x: |
| Paths | /tasks | :white_check_mark: | :x: |
| Paths | /tasks/{id} | :white_check_mark: | :x: |
| Paths | /userRoles | :x: | :x: |
| Paths | /vacations | :x: | :x: |