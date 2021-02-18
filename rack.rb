require "rubygems"
require 'sinatra'

get '/tree-sitter.js' do
  send_file File.join("ts", "tree-sitter.js")
end

get '/tree-sitter.wasm' do
  send_file File.join("ts", "tree-sitter.wasm")
end

get "/" do
  File.read("index.html")
end
