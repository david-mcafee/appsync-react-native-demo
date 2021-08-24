import React, { useEffect } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { graphqlMutation } from "aws-appsync-react";
// TODO: add to react web demo
import { buildSubscription } from "aws-appsync";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";

// include description in docs to match default setup
const CreateTodo = gql`
  mutation createTodo($name: String!, $description: String!) {
    createTodo(input: { name: $name, description: $description }) {
      name
      description
    }
  }
`;

// include description in docs to match default setup
const listTodos = gql`
  query listTodo {
    listTodos {
      items {
        id
        name
        description
      }
    }
  }
`;

// TODO: add to react web demo
const PostSubscription = gql`
  subscription postSubscription {
    onCreatePost {
      id
      name
    }
  }
`;

const initialState = { name: "", description: "" };

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    this.props.data.subscribeToMore(
      buildSubscription(PostSubscription, listPosts)
    );
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function signOut() {
    return await Auth.signOut()
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
  }

  addTodo = () =>
    this.props.createTodo({
      name: this.state.name,
      description: this.state.description,
    });

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

export default compose(
  graphql(listTodos, {
    options: {
      fetchPolicy: "cache-and-network",
    },
    props: (props) => ({
      todos: props.data.listTodos ? props.data.listTodos.items : [],
    }),
  }),
  graphqlMutation(CreateTodo, listTodos, "Todo")
)(App);
