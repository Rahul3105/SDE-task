
# File Management System

As name suggest, it is file management system just like google drive.





## Features

- Create folders nestedly.
- Upload files in any folder.
- Rename file and folders.
- Delete file and folders.
- Organize the folder (it will automatically create folders for respective file type and put files in those folders).
- Move file and folders from one folder to another






## How to run code locally

- Clone the repo.
- run npm install command inside that repo.
- run npm run server.




## API Reference

#### Register User

```http
  POST /api/signup
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `first_name` | `string` | **Required**. Your firstname |
| `last_name` | `string` | **Required**. Your lastname |
| `email` | `string` | **Required**. Your email |
| `password` | `string` | **Required**. Your password |

#### Login User

```http
  POST /api/login

```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email` | `string` | **Required**. Your email |
| `password` | `string` | **Required**. Your password |

####  Get a particular directory

```http
  GET /api/my-directory/:id

```
| header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. token |


#### For creating a new directory inside a particular directory


```http
  PATCH /api/my-directory/directory/create/:id

```
| header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. token |

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `directory_name` | `string` | **Required**. new directory name |




#### For creating a new file inside a particular directory


```http
  PATCH /api/my-directory/file/create/:id

```
| header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. token |

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `file` | `form-data` | **Required**. file |





#### For deleting a directory (only if it is empty)


```http
  DELETE /api/my-directory/directory/:id

```
| header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. token |



#### For deleting a file


```http
  DELETE /api/my-directory/file/:id

```
| header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. token |


| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `parent` | `Mongoose object_id` | **Required**. file parent id|







#### For renaming a directory


```http
  PATCH /api/my-directory/directory/rename/:id

```
| header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. token |


| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `directory_name` | `string` | **Required**. new name|







#### For renaming a file


```http
  PATCH /api/my-directory/directory/file/:id

```
| header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. token |


| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `file_name` | `string` | **Required**. new name|
| `parent` | `Mongoose object_id` | **Required**. file parent id|





#### For moving one directory to another



```http
  PATCH /api/my-directory/directory/move/:id

```
| header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. token |


| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `newParentID` | `Mongoose object_id` | **Required**. previous parent id|
| `prevParentID` | `Mongoose object_id` | **Required**. new parent id|



#### For moving one file to another directory



```http
  PATCH /api/my-directory/file/move/:id

```
| header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. token |


| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `newParentID` | `Mongoose object_id` | **Required**. previous parent id|
| `prevParentID` | `Mongoose object_id` | **Required**. new parent id|





#### For organizing a directory



```http
  PATCH /api/my-directory/directory/organize/:id

```
| header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token` | `string` | **Required**. token |

