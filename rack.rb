require "rubygems"
require 'sinatra'
require 'sinatra/cross_origin'

configure do
  enable :cross_origin
end

set :allow_origin, :any
set :allow_methods, [:get, :post, :options]

get '/tree-sitter.js' do
  headers 'Access-Control-Allow-Origin' => 'http://0.0.0.0:3000'
  response['Access-Control-Allow-Origin'] = 'http://0.0.0.0:3000'
  File.read File.join("public", "tree-sitter.js")
end

get '/tree-sitter.wasm' do
  cross_origin

  headers 'Access-Control-Allow-Origin' => 'http://0.0.0.0:3000'
  response['Access-Control-Allow-Origin'] = 'http://0.0.0.0:3000'

  headers 'Content-Type' => 'application/wasm;charset=utf-8'
  response['Content-Type'] = 'application/wasm;charset=utf-8'

  File.read File.join("public", "tree-sitter.wasm")
end

options "*" do
  response.headers["Allow"] = "HEAD,GET,PUT,POST,DELETE,OPTIONS"
  response.headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Cache-Control, Accept"
  200
end
