# Human Page Tool

This tool is used to manually extract valuable text from a web page. The goal is to extract the text that is most likely to be useful to a human reader. This is useful for:

- creating a summary of a web page
- creating a "clean" version of a web page that can be used for other purposes
- producing a dataset of text that can be used for training a machine learning model.

The extraction is focused on finding "snippets" of text that are likely to be useful to a human reader. Structure can be found below.

## Usage

### Development

```
$ yarn
$ yarn start
```

### Build

```
$ yarn make
```

### Schemas

#### Snippet

```
type Snippet {
  markdown: string
  xpath: string
}
```

#### Input

Input should be a folder of json files with the following structure:

```
type Input {
  title: string
  url: string
  page: {
    data: string
  }
}
```

#### Output

Output is stored in a neighboring folder called `extracted`. The output is a json file with the following structure:

```
type Output {
  title: string
  url: string
  page: {
    data: string
  }
  snippets: Snippet[]
}
```
