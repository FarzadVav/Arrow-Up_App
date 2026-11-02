# **Bug & Refactor**

```
Change journals tags to static, that is mean user don't able to change them.

Journals>Logs tags: good things, bad events, new experiences, social interactions, challenges, observations.

Journals>Thoughts: ideas, questions, reflections, future plans, possibilities, aspirations.

Journals>Feelings: positives, negatives, numbness, confusion.

Journals>Notes: playbooks, resources, inbox, temporary.

---

Also a new user should have these life areas by default and the user can edit them whenever: lifestyle, health, career, social connections.

---

Also optimize db:seed based on the latest db schemas and this default datas.
Also check that life areas, categories and tags connect to the entities with a real database id relation, if they deleted the entities should be exists and the relation id field change to null.
Also if an entity have life areas, category or tag, so on create/edit user must set them and can't send null data.

---

Respect the project structure and code style and use the reusable stuff.
```

```
in framework and skills pages: if an entity have not a life area shown in the inner general page (not set).
but we have some logical issues:
1. the ui "general" name should deleted and writed by "abandoned".
2. in the inner not-set page we should not have tags.
```

- New Reusable components (Card, Text, Row, List)
- Reusable components
- Folder and file structured
- Back redirection to prev active tab
- Optimize translations
- Optimize helps
- Optimize UI

---

# **Clean Code**

- ### Segments
  1. Login
  2. Profile
  3. Life Areas
  4. Todos
  5. Framework
  6. Skills
  7. Journals

- ### Topics
  1. Folders, Features, Components, Hooks, Mutations, Queries, Repositories, Lib, Files
  2. Code-Splitting, TSX/HTML and Styling Designs
  3. States, Hooks, Fetches, Form Actions, Forms, Re-Renders
  4. DB, ORM, Repositories, Queries, Mutations, Business Logics
  5. PWA (and the offline page)

---

# **Features**

- Add repeat-interval with a stack for missions disciplines (Stack should handle with cron jobs)
- Add pending state for missions (With a start date)

---

# **Ideas**

_Nothing_

---
