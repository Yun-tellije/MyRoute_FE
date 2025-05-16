export default class TrieNode {
  constructor() {
    this.children = {}
    this.isEndOfWord = false
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode()
  }

  insert(word) {
    let node = this.root
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode()
      node = node.children[ch]
    }
    node.isEndOfWord = true
  }

  startsWith(prefix) {
    let node = this.root
    for (const ch of prefix) {
      if (!node.children[ch]) return []
      node = node.children[ch]
    }
    return this._collectWords(prefix, node)
  }

  _collectWords(prefix, node) {
    let results = []
    if (node.isEndOfWord) results.push(prefix)
    for (const ch in node.children) {
      results = results.concat(this._collectWords(prefix + ch, node.children[ch]))
    }
    return results
  }
}
