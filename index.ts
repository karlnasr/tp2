import { ApolloServer, gql } from 'apollo-server-express';
import { startStandaloneServer } from '@apollo/server/standalone';
import axios from 'axios';

const typeDefs = gql`
  type Film {
    id: ID!
    title: String!
    people: [People!]!
  }

  type People {
    id: ID!
    name: String!
    eyeColor: String!
    films: [Film!]!
  }

  type Query {
    getFilms: [Film!]!
    getPeople: [People!]!
  }
`;

const resolvers = {
    Query: {
      getFilms: async () => {
        try {
          const response = await axios.get('https://ghibliapi.dev/films');
          return response.data.map((film: any) => ({
            id: film.id,
            title: film.title,
            people: film.people.filter((url: string) => url.includes('/people/')).map((url: string) => ({ id: url.split('/').pop() }))
          }));
        } catch (error) {
          throw new Error('Erreur lors de la récupération des films');
        }
      },
      getPeople: async () => {
        try {
          const response = await axios.get('https://ghibliapi.dev/people');
          return response.data.map((person: any) => ({
            id: person.id,
            name: person.name,
            eyeColor: person.eye_color,
            films: person.films.filter((url: string) => url.includes('/films/')).map((url: string) => ({ id: url.split('/').pop() }))
          }));
        } catch (error) {
          throw new Error('Erreur lors de la récupération des personnes');
        }
      }
    },
    Film: {
        people: async (parent: any) => {
          try {
            const response = await axios.get(`https://ghibliapi.dev/films/${parent.id}`);
            return response.data.people.filter((url: string) => url.includes('/people/')).map((url: string) => ({ id: url.split('/').pop() }));
          } catch (error) {
            throw new Error('Erreur lors de la récupération des personnages du film');
          }
        }
      },
      People: {
        films: async (parent: any) => {
          try {
            const response = await axios.get(`https://ghibliapi.dev/people/${parent.id}`);
            return response.data.films.filter((url: string) => url.includes('/films/')).map((url: string) => ({ id: url.split('/').pop() }));
          } catch (error) {
            throw new Error('Erreur lors de la récupération des films associés à la personne');
          }
        }
      }
    };

    const server = new ApolloServer({
      typeDefs,
      resolvers
    })
    
    const {url} = await startStandaloneServer(server, {
      listen: {port: 4000}
    })
    
    console.log(`🚀  Server ready at: ${url}`)