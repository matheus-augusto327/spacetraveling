import { Hash } from 'crypto';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

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

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <p>Carregando...</p>
    );
  };

  const wordsPerMinute = 200
  const totalWords = Math.round(
    post.data.content.reduce(
      (acc, contentItem) =>
        acc +
        contentItem.heading.toString().split(' ').length +
        contentItem.body.reduce(
          (acc2, bodyItem) => acc2 + bodyItem.text.toString().split(' ').length,
          0
        ),
      0
    )
  );
  const totalMinutes = Math.ceil(totalWords / wordsPerMinute)

  return (
    <>
      <Head>
        <title>Spacetraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <Header />
        <img src={post.data.banner.url} alt="Banner" className={styles.banner} />
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.postInfoContainer}>
                  <div>
                    <FiCalendar className={commonStyles.icon} />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </time>
                  </div>
                  <div>
                    <FiUser className={commonStyles.icon} />
                    <span>{post.data.author}</span>
                  </div>
                  <div>
                    <FiClock className={commonStyles.icon} />
                    <span>{totalMinutes} min</span>
                  </div>
                </div>
          <div 
            key={post.data.title}
            className={styles.postContent}
          >
            {post.data.content.map(contentItem => (
              <div
                key={JSON.stringify(Math.random)}
                className={styles.contentItem}
              >
                <h2>{contentItem.heading}</h2>
                <div
                  className={styles.body}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(contentItem.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  )

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

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    }
  }

  return {
    props: {
      post,
      revalidate: 1 * 60 * 60
    }
  }
}
