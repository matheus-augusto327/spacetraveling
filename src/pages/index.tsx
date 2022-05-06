import { GetStaticProps } from 'next';
import { Head } from 'next/document';
import Link from 'next/link'
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

export default function Home({ postsPagination }: HomeProps) {
  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>

      <main /*className={styles.container}*/>
        <div /*className={styles.posts}*/>
          {postsPagination.results.map(post => (
            <Link key={post.uid} href={`/${post.uid}`}>
              <a>
                <p>{post.data.author}</p>
                <time>{post.first_publication_date}</time>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )

}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType(
    'post',
    {
      fetch: ['post.title', 'post.author', 'post.subtitle'],
      pageSize: 100,
    });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: RichText.asText(post.data.title),
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    }
  }

};
