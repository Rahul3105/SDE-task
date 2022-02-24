
# File Management System

As name suggest, it is file management system just like google drive.


# Frontend Hosted URL

```
https://nifty-bartik-bd1bb8.netlify.app/
```
###### Note:- this frontend if just for testing the API's, created this in very hurry, so please don't judge my frontend skills😓

## Features

- Create folders nestedly.
- Upload files in any folder.
- Rename files and folders.
- Delete files and folders.
- Copy files and folders
- Organize the folder (it will automatically create folders for respective file type and put files in those folders).
- Move file and folders from one folder to another






## How to run code locally

- Clone the repo.
- run npm install command inside that repo.
- create env file with -

```

MONGO_DB_PASSWORD
JWT_SECRET_KEY

```
- run npm run server.


## API's Implemented

### Register User

```http
  POST /api/signup
```
#### Request Body

| Key | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `first_name` | `string` | **Required**. Your firstname |
| `last_name` | `string` | **Required**. Your lastname |
| `email` | `string` | **Required**. Your email |
| `password` | `string` | **Required**. Your password |

### Login User

```http
  POST /api/login

```
#### Request Body

| Key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email` | `string` | **Required**. Your email |
| `password` | `string` | **Required**. Your password |












###  Get a particular directory

```
  GET /api/my-directory/directory/:id

```

#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |

#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of directory that you wanna get  |




### For creating a new directory inside a particular directory


```http
  PATCH /api/my-directory/directory/create/:id

```

#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |

#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of directory where you wanna create new directory  |

#### Request Body
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `directory_name` | `string` | **Required**. new directory name |
| `sub_directories` | `array` | mongoose objectID of children directories |
| `files` | `array` | mongoose objectID of children files |





### For deleting a directory (only if it is empty)


```http
  DELETE /api/my-directory/directory/:id

```
#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |


#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of directory which you wanna delete  |

### For renaming a directory


```http
  PATCH /api/my-directory/directory/rename/:id

```
#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |


#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of directory which you wanna rename  |
 
#### Request Body

| Key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `directory_name` | `string` | **Required**. new name|




### For moving one directory to another directory



```http
  PATCH /api/my-directory/directory/move/:id

```
#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |

#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of directory which you wanna move  |
 
#### Request Body
| Key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `newParentID` | `Mongoose object_id` | **Required**. previous parent id|
| `prevParentID` | `Mongoose object_id` | **Required**. new parent id|








### For organizing a directory



```http
  PATCH /api/my-directory/directory/organize/:id

```
#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |


#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of directory which you wanna organize  |
 





### For copy pasting a directory a directory



```http
  PATCH /api/my-directory/directory/copy/:id

```
#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |


#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of directory which you wanna paste  |
 


#### Request Body
| Key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `newParentID` | `Mongoose object_id` | **Required**. new parent id|

















### For creating a new file inside a particular directory


```http
  PATCH /api/my-directory/file/create/:id

```
#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |


#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of directory where you wanna create this file  |
 


#### Request Body
| Key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `file` | `form-data` | **Required**. uploaded file|








### For deleting a file


```http
  DELETE /api/my-directory/file/:id

```


#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |


#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of file that you wanna delete |
 
#### Request Body

| Key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `parent` | `Mongoose object_id` | **Required**. file parent id|







### For renaming a file


```http
  PATCH /api/my-directory/file/rename/:id

```
#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |


#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of file that you wanna rename |
 

#### Request Body

| Key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `file_name` | `string` | **Required**. new name|
| `parent` | `Mongoose object_id` | **Required**. file parent id|





### For moving one file to another directory



```http
  PATCH /api/my-directory/file/move/:id

```
#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |


#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of file that you wanna move |
 

#### Request Body
| Key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `newParentID` | `Mongoose object_id` | **Required**. new parent id|
| `prevParentID` | `Mongoose object_id` | **Required**. previous parent id|




### For copy pasting one file to another directory



```http
  PATCH /api/my-directory/file/copy/:id

```
#### Request Header
| key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `authentication` | `string` | **Required**. bearer token |


#### Request Parameter
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id` | `string` | id of file that you wanna paste |
 


#### Request Body

| Key | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `newParentID` | `Mongoose object_id` | **Required**. new parent id|


## Important Technical Decisions (ITD)
```
https://docs.google.com/document/d/15OErep8IoQTxl8esbW1cfVcAJoJPUpv9dlMS_Jgp2Lo/edit?usp=sharing
```
