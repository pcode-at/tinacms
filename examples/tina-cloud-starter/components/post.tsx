import React from "react";
import Markdown from "react-markdown";
import { Container } from "./container";
import { Section } from "./section";
import { ThemeContext } from "./theme";
import format from "date-fns/format";
import type { Root, Content } from "mdast";
import type { Descendant } from "slate";
import { Hero } from "./blocks/hero";
import { Content as ContentBlock } from "./blocks/content";
import { Testimonial } from "./blocks/testimonial";
import { Features } from "./blocks/features";

const blockRenderer = {
  Hero: (props) => <Hero data={props} />,
  Features: (props) => <Features data={props} />,
  Testimonial: (props) => <Testimonial data={props} />,
  ContentBlock: (props) => <ContentBlock data={props} />,
  Highlight: (props) => {
    return <span style={{ background: "yellow", color: "black" }} {...props} />;
  },
  LiveData: (props) => {
    switch (props.value) {
      case "currentTime":
        return <Timer {...props} />;
      case "currentURL":
        return <span>You're viewing a page at {window.location.href}</span>;
      default:
        return null;
    }
  },
};
export default function useInterval(callback, delay) {
  const callbacRef = React.useRef(null);

  // update callback function with current render callback that has access to latest props and state
  React.useEffect(() => {
    callbacRef.current = callback;
  });

  React.useEffect(() => {
    if (!delay) {
      return () => {};
    }

    const interval = setInterval(() => {
      callbacRef.current && callbacRef.current();
    }, delay);
    return () => clearInterval(interval);
  }, [delay]);
}

const Timer = () => {
  const [time, setTime] = React.useState(0);
  useInterval(() => setTime(time + 1), 1000);

  return <span>Counting... {time}</span>;
};

export const Post = ({ data }) => {
  const theme = React.useContext(ThemeContext);
  const titleColorClasses = {
    blue: "from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500",
    teal: "from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500",
    green: "from-green-400 to-green-600",
    red: "from-red-400 to-red-600",
    pink: "from-pink-300 to-pink-500",
    purple:
      "from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500",
    orange:
      "from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500",
    yellow:
      "from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500",
  };

  const date = new Date(data.date);
  const formattedDate = format(date, "MMM dd, yyyy");

  return (
    <Section className="flex-1">
      <Container className={`flex-1 max-w-4xl pb-2`} size="large">
        <h2
          className={`w-full relative	mb-8 text-6xl font-extrabold tracking-normal text-center title-font`}
        >
          <span
            className={`bg-clip-text text-transparent bg-gradient-to-r ${
              titleColorClasses[theme.color]
            }`}
          >
            {data.title}
          </span>
        </h2>

        <div className="flex items-center justify-center mb-16">
          {data.author && (
            <>
              <div className="flex-shrink-0 mr-4">
                <img
                  className="h-14 w-14 object-cover rounded-full shadow-sm"
                  src={data.author.data.avatar}
                  alt={data.author.data.name}
                />
              </div>
              <p className="text-base font-medium text-gray-600 group-hover:text-gray-800 dark:text-gray-200 dark:group-hover:text-white">
                {data.author.data.name}
              </p>
              <span className="font-bold text-gray-200 dark:text-gray-500 mx-2">
                —
              </span>
            </>
          )}
          <p className="text-base text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-150">
            {formattedDate}
          </p>
        </div>
      </Container>
      {data.heroImg && (
        <div className="">
          <img
            src={data.heroImg}
            className="mb-14 block h-auto max-w-4xl lg:max-w-6xl mx-auto"
          />
        </div>
      )}
      <Container className={`flex-1 max-w-4xl pt-4`} size="large">
        <div className="prose dark:prose-dark  w-full max-w-none">
          <Markdown2>{data._body}</Markdown2>
        </div>
      </Container>
    </Section>
  );
};

const Markdown2 = (props) => {
  if (typeof props.children === "string") {
    return <Markdown>{props.children}</Markdown>;
  } else {
    const ast = props.children as Root;
    if (props.children.type === "root") {
      return <MarkdownContent>{ast.children}</MarkdownContent>;
    } else {
      return <SlateContent>{props.children}</SlateContent>;
    }
  }
};

const SlateContent = ({
  children,
  blocks = blockRenderer,
}: {
  children: Descendant[];
}) => {
  return (
    <>
      {children.map((child) => {
        switch (child.type) {
          case defaultNodeTypes.heading[1]:
            return (
              <h1>
                <SlateContent>{child.children}</SlateContent>
              </h1>
            );
          case defaultNodeTypes.heading[2]:
            return (
              <h2>
                <SlateContent>{child.children}</SlateContent>
              </h2>
            );
          case defaultNodeTypes.heading[3]:
            return (
              <h3>
                <SlateContent>{child.children}</SlateContent>
              </h3>
            );
          case defaultNodeTypes.heading[4]:
            return (
              <h4>
                <SlateContent>{child.children}</SlateContent>
              </h4>
            );
          case defaultNodeTypes.heading[5]:
            return (
              <h5>
                <SlateContent>{child.children}</SlateContent>
              </h5>
            );
          case defaultNodeTypes.heading[6]:
            return (
              <h1>
                <SlateContent>{child.children}</SlateContent>
              </h1>
            );
          case defaultNodeTypes.paragraph:
            return (
              <p>
                <SlateContent>{child.children}</SlateContent>
              </p>
            );
          case defaultNodeTypes.link:
            return (
              <a href={child.link}>
                <SlateContent>{child.children}</SlateContent>
              </a>
            );
          case "mdxJsxTextElement":
          case "mdxJsxFlowElement":
            const Block = blocks[child.node.name];
            if (Block) {
              console.log(child);
              return (
                <Block {...child.node.attributes}>
                  <SlateContent>{child.children}</SlateContent>
                </Block>
              );
            }
          default:
            if (!child.text && child.type) {
              console.log(`Didn't find element of type ${child.type}`, child);
            }
            return child.text;
        }
      })}
    </>
  );
};

const MarkdownContent = ({
  children,
  blocks = blockRenderer,
}: {
  children: Content[];
  blocks?: { [key: string]: (props) => React.ReactNode };
}) => {
  return (
    <>
      {children.map((child) => {
        switch (child.type) {
          case "heading":
            switch (child.depth) {
              case 1:
                return (
                  <h1>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h1>
                );
              case 2:
                return (
                  <h2>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h2>
                );
              case 3:
                return (
                  <h3>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h3>
                );
              case 4:
                return (
                  <h4>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h4>
                );
              case 5:
                return (
                  <h5>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h5>
                );
              case 6:
                return (
                  <h6>
                    <MarkdownContent>{child.children}</MarkdownContent>
                  </h6>
                );
            }
          case "paragraph":
            return (
              <p>
                <MarkdownContent>{child.children}</MarkdownContent>
              </p>
            );
          case "link":
            return (
              <a href={child.url} title={child.title}>
                <MarkdownContent>{child.children}</MarkdownContent>
              </a>
            );
          case "break":
            return <br />;
          case "thematicBreak":
            return <hr />;
          case "text":
            return <span>{child.value}</span>;
          // for some reason html inline elements are here
          case "mdxJsxTextElement":
            const InlineBlock = blocks[child.name];
            if (InlineBlock) {
              return (
                <InlineBlock {...child.attributes}>
                  <MarkdownContent>{child.children}</MarkdownContent>
                </InlineBlock>
              );
            }
            const atts = {};
            // child.attributes.forEach((att) => (atts[att.name] = att.value));
            return React.createElement(child.name, {
              ...atts,
              children: <MarkdownContent>{child.children}</MarkdownContent>,
            });
          // for some reason html block elements are here
          case "mdxJsxFlowElement":
            const Block = blocks[child.name];
            if (Block) {
              return (
                <Block {...child.attributes}>
                  <MarkdownContent>{child.children}</MarkdownContent>
                </Block>
              );
            }

            const blockAtts = {};
            child.attributes.forEach(
              (att) => (blockAtts[att.name] = att.value)
            );
            // Void elements can't have `children`, there are a lot of others
            const extraProps = ["img"].includes(child.name)
              ? {}
              : {
                  children: <MarkdownContent>{child.children}</MarkdownContent>,
                };
            return React.createElement(child.name, {
              ...blockAtts,
              ...extraProps,
            });
          default:
            console.log("not found ", child.type);
            return <div>NOT FOUND</div>;
        }
      })}
    </>
  );
};

export interface NodeValueTypes {
  paragraph: string;
  block_quote: string;
  code_block: string;
  link: string;
  image: string;
  ul_list: string;
  ol_list: string;
  listItem: string;
  heading_one: string;
  heading_two: string;
  heading_three: string;
  heading_four: string;
  heading_five: string;
  heading_six: string;
  emphasis_mark: string;
  strong_mark: string;
  delete_mark: string;
  inline_code_mark: string;
  thematic_break: string;
  // MDX-specific types
  mdxJsxFlowElement: string;
  mdxJsxTextElement: string;
}

export interface NodeTypes {
  paragraph: string;
  block_quote: string;
  code_block: string;
  link: string;
  image: string;
  ul_list: string;
  ol_list: string;
  listItem: string;
  heading: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
  };
  emphasis_mark: string;
  strong_mark: string;
  delete_mark: string;
  inline_code_mark: string;
  thematic_break: string;
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export interface OptionType {
  nodeTypes?: RecursivePartial<NodeTypes>;
  linkDestinationKey?: string;
  imageSourceKey?: string;
  imageCaptionKey?: string;
}

export interface MdastNode {
  type?: string;
  ordered?: boolean;
  value?: string;
  text?: string;
  children?: Array<MdastNode>;
  depth?: 1 | 2 | 3 | 4 | 5 | 6;
  url?: string;
  alt?: string;
  lang?: string;
  // mdast metadata
  position?: any;
  spread?: any;
  checked?: any;
  indent?: any;
}

export const defaultNodeTypes: NodeTypes = {
  paragraph: "paragraph",
  block_quote: "block_quote",
  code_block: "code_block",
  link: "link",
  ul_list: "ul_list",
  ol_list: "ol_list",
  listItem: "list_item",
  heading: {
    1: "heading_one",
    2: "heading_two",
    3: "heading_three",
    4: "heading_four",
    5: "heading_five",
    6: "heading_six",
  },
  emphasis_mark: "italic",
  strong_mark: "bold",
  delete_mark: "strikeThrough",
  inline_code_mark: "code",
  thematic_break: "thematic_break",
  image: "image",
};

export function deserialize(node: MdastNode, opts?: OptionType) {
  const types = {
    ...defaultNodeTypes,
    ...opts?.nodeTypes,
    heading: {
      ...defaultNodeTypes.heading,
      ...opts?.nodeTypes?.heading,
    },
  };

  const linkDestinationKey = opts?.linkDestinationKey ?? "link";
  const imageSourceKey = opts?.imageSourceKey ?? "link";
  const imageCaptionKey = opts?.imageCaptionKey ?? "caption";

  let children = [{ text: "" }];

  if (
    node.children &&
    Array.isArray(node.children) &&
    node.children.length > 0
  ) {
    children = node.children.map((c: MdastNode) =>
      deserialize(
        {
          ...c,
          ordered: node.ordered || false,
        },
        opts
      )
    );
  }

  switch (node.type) {
    case "heading":
      return { type: types.heading[node.depth || 1], children };
    case "list":
      return { type: node.ordered ? types.ol_list : types.ul_list, children };
    case "listItem":
      return { type: types.listItem, children };
    case "paragraph":
      return { type: types.paragraph, children };
    case "link":
      return { type: types.link, [linkDestinationKey]: node.url, children };
    case "image":
      return {
        type: types.image,
        children: [{ text: "" }],
        [imageSourceKey]: node.url,
        [imageCaptionKey]: node.alt,
      };
    case "blockquote":
      return { type: types.block_quote, children };
    case "code":
      return {
        type: types.code_block,
        language: node.lang,
        children: [{ text: node.value }],
      };

    case "html":
      if (node.value?.includes("<br>")) {
        return {
          break: true,
          type: types.paragraph,
          children: [{ text: node.value?.replace(/<br>/g, "") || "" }],
        };
      }
      return { type: "paragraph", children: [{ text: node.value || "" }] };

    case "emphasis":
      return {
        [types.emphasis_mark]: true,
        ...forceLeafNode(children),
        ...persistLeafFormats(children),
      };
    case "strong":
      return {
        [types.strong_mark]: true,
        ...forceLeafNode(children),
        ...persistLeafFormats(children),
      };
    case "delete":
      return {
        [types.delete_mark]: true,
        ...forceLeafNode(children),
        ...persistLeafFormats(children),
      };
    case "inlineCode":
      return {
        [types.inline_code_mark]: true,
        text: node.value,
        ...persistLeafFormats(children),
      };
    case "thematicBreak":
      return {
        type: types.thematic_break,
        children: [{ text: "" }],
      };

    case "root":
      return children;
    case "mdxJsxTextElement":
      return {
        type: "mdxJsxTextElement",
        node: node,
        children: [{ text: "" }],
      };
    case "mdxJsxFlowElement":
      return {
        type: "mdxJsxFlowElement",
        node: node,
        children: [{ text: "" }],
      };
    case "text":
    default:
      return { text: node.value || "" };
  }
}

const forceLeafNode = (children: Array<{ text?: string }>) => ({
  text: children.map((k) => k?.text).join(""),
});

// This function is will take any unknown keys, and bring them up a level
// allowing leaf nodes to have many different formats at once
// for example, bold and italic on the same node
function persistLeafFormats(children: Array<MdastNode>) {
  return children.reduce((acc, node) => {
    Object.keys(node).forEach(function (key) {
      if (key === "children" || key === "type" || key === "text") return;

      // @ts-ignore
      acc[key] = node[key];
    });

    return acc;
  }, {});
}

export interface LeafType {
  text: string;
  strikeThrough?: boolean;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  parentType?: string;
}

export interface BlockType {
  type: string;
  parentType?: string;
  link?: string;
  caption?: string;
  language?: string;
  break?: boolean;
  children: Array<BlockType | LeafType>;
}
