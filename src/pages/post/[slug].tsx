import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post( {post}: PostProps ) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <p>Carregando...</p>
    );
  };

}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType(
    'post',
    {
      fetch: ['post.title', 'post.author', 'post.subtitle'],
      pageSize: 2,
    });

    const paths = posts.results.map(post => {
      return {
        params: {
          slug: post.uid
        }
        
      }
    })

  return {
    paths: paths,
    fallback: true,
  }
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID<any>('post', String(slug), {});

  console.log(response.data.content.heading);

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      // content: {
      //   heading: response.data.content.heading,
      //   body: {
      //     text: response.data.content.body,
      //   },
      // },
    }
  }

  return {
    props: {
      post,
      revalidate: 1 * 60 * 60
    }
  }
}
