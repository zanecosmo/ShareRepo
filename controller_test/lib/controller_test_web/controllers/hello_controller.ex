defmodule ControllerTestWeb.HelloController do
use ControllerTestWeb, :controller
    
    def index(conn, _params) do
        render(conn, "index.html")
    end
    
end