# swagger2http
This is a simple script to transform Swagger OpenAPI files to `.http` files like this one, which is is used in tools like [rest.nvim](https://github.com/rest-nvim/rest.nvim):

~~~http
POST https://reqres.in/api/users
Content-Type: application/json

{
  "name": "morpheus",
  "job": "leader",
  "array": ["a", "b", "c"],
  "object_ugly_closing": {
    "some_key": "some_value"
  }
}
~~~

**OBS.:** You will need to adapt this script to your own necessities.
