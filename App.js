import { Auth } from "aws-amplify";
import { gql, useSubscription } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";

const initialState = { name: "", description: "" };

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function signOut() {
    return await Auth.signOut()
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
  }

  // List
  const LIST_TODOS = gql`
    query listTodos {
      listTodos {
        items {
          id
          name
          description
        }
      }
    }
  `;

  const {
    loading: listLoading,
    data: listData,
    error: listError,
  } = useQuery(LIST_TODOS);

  useEffect(() => {
    if (listData) {
      setTodos(listData?.listTodos?.items);
    }
  }, [listData]);

  // Create
  const CREATE_TODO = gql`
    mutation createTodo($input: CreateTodoInput!) {
      createTodo(input: $input) {
        id
        name
        description
        createdAt
        updatedAt
      }
    }
  `;

  // Optional: use `data`, `loading`, and `error`.
  // Can also use refretch if not using a subscription:
  // const [addTodoMutateFunction] = useMutation(CREATE_TODO, {
  //   refetchQueries: [LIST_TODOS, "listTodos"],
  // });
  const [addTodoMutateFunction, { error: createError }] =
    useMutation(CREATE_TODO);

  if (createError) {
    console.error(createError);
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todoId = uuidv4();
      const todo = { id: todoId, ...formState };
      setFormState(initialState);
      addTodoMutateFunction({ variables: { input: { ...todo } } });
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  // Delete
  const DELETE_TODO = gql`
    mutation deleteTodo($input: DeleteTodoInput!) {
      deleteTodo(input: $input) {
        id
        name
        description
      }
    }
  `;

  // Optional: use `data`, `loading`, and `error`
  const [deleteTodoMutateFunction] = useMutation(DELETE_TODO, {
    refetchQueries: [LIST_TODOS, "listTodos"],
  });

  async function removeTodo(id) {
    try {
      deleteTodoMutateFunction({ variables: { input: { id } } });
    } catch (err) {
      console.log("error deleting todo:", err);
    }
  }

  const CREATE_TODO_SUBSCRIPTION = gql`
    subscription OnCreateTodo {
      onCreateTodo {
        id
        name
        description
        createdAt
        updatedAt
      }
    }
  `;

  const { data: createSubData, error: createSubError } = useSubscription(
    CREATE_TODO_SUBSCRIPTION
  );

  if (
    createSubData &&
    todos.filter((todo) => todo.id === createSubData?.onCreateTodo?.id)
      .length === 0
  ) {
    setTodos([...todos, createSubData?.onCreateTodo]);
  } else if (createSubError) {
    console.error(createSubError);
  }

  let status = "";

  if (listLoading) {
    status = "Loading todos...";
  } else if (listError) {
    status = "Error loading todos!";
  }

  return (
    <View style={styles.container}>
      <Text>{"Todos using Apollo V3"}</Text>
      <Text>{status}</Text>
      <Button title="Sign Out" onPress={signOut} />
      <TextInput
        onChangeText={(val) => setInput("name", val)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <TextInput
        onChangeText={(val) => setInput("description", val)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <Button title="Create Todo" onPress={addTodo} />
      {todos.map((todo, index) => (
        <View key={todo.id ? todo.id : index} style={styles.todo}>
          <Text style={styles.todoName}>{todo.name}</Text>
          <Text>{todo.description}</Text>
          <Button title="Delete" onPress={() => removeTodo(todo.id)} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  todo: { marginBottom: 15 },
  input: { height: 50, backgroundColor: "#ddd", marginBottom: 10, padding: 8 },
  todoName: { fontSize: 18 },
});

export default App;
