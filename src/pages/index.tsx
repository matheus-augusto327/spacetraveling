import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar } from "react-icons/fi";
import { FiUser } from "react-icons/fi";
import { FiClock } from "react-icons/fi";

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Header from '../components/Header';
import { useState } from 'react';

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

  const [pagination, setPagination] = useState(postsPagination);

  function loadMorePosts() {
    fetch(postsPagination.next_page)
      .then((response) => response.json())
      .then((result) => {
        const newPagination: PostPagination = {
          next_page: result.next_page,
          results: [
            ...pagination.results,
            ...result.results,
          ],
        };
        setPagination(newPagination);
      })
      .catch((error) => {
        return console.log(error.message);
      });
    return;
  };

  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <Header />

        <div className={styles.posts}>
          {pagination.results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <time>
                  <FiCalendar className={styles.icon} />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <p><FiUser className={styles.icon} />{post.data.author}</p>
              </a>
            </Link>
          ))}
        </div>

        {pagination.next_page && (
          <button
            onClick={() => loadMorePosts()}
          >
            Carregar mais posts
          </button>
        )}

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
      pageSize: 1,
    });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
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
