import { GetStaticProps } from 'next';
import { Head } from 'next/document';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ post }: Post) {
  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>

      <main /*className={styles.container}*/>
        <div /*className={styles.posts}*/>
          {post}
        </div>
      </main>
    </>
  )

}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    fetch: ['post.title', 'post.content'],
    pageSize: 5,
  });

  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
    }
  })

  return {
    props: {
      posts
    }
  }

};
