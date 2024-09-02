# NEST JS codegen (mvp 0)

## Что умеет:
генерирует по swagger.yaml контроллеры и dto с учетом nestjs/swagger плагина.

# Важно !

- Не редактируйте файлы *.dto.ts и *.controller.ts, так как они генерируемые и отключить их генерацию нельзя! Исключением является поправить стили и добавить импорты, пока это не будет создано

- Не используйте схемы без названия, так как nest при обратной генерации понимает только именованные схемы. Например:
```yaml
# Правильно
put:
  parameters:
    - name: uuid
      required: true
      in: path
      schema:
        type: string
  requestBody:
    required: true
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/CategoryBody" # правильно

# Неправильно
put:
  parameters:
    - name: uuid
      required: true
      in: path
      schema:
        type: string
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object # неправильно, ошибка. Используйте $ref
          properties:
            title:
              type: string
          required:
            - title
```

## Hints:
- понимает $ref;
- понимает enums;
- сортирует роуты по методам;
- поддерживает allOf;
- можно изменить путь генерации;
- можно использовать вместе с nest cli



# TODOS:

1. добавить линтеры;
2. настроить shared импорты dto-шек;
3. сделать опциональную интеграцию модулей в app module;
4. сделать опциональную генерацию модулей;
5. сделать опциональную генерацию сервисов (*.service.draft.ts);
6. добавить интеграцию дополнительных параметров (example, min, minLength и тд) в dto
7. добавить опциональную генерацию entity
8. рефактор всего кода.
9. сделать обработку ошибочных ответов (4хх,5хх статусы) (возможно в таску про сервисы)