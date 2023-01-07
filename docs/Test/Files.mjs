/*
(c) 2023 Scot Watson  All Rights Reserved
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import * as Types from "https://scotwatson.github.io/Debug/Test/Types.mjs";
import * as ErrorLog from "https://scotwatson.github.io/Debug/Test/ErrorLog.mjs";
import * as StreamOps from "https://scotwatson.github.io/Streams/Test/Operations.mjs";
import * as Memory from "https://scotwatson.github.io/Memory/Test/Memory.mjs";

export function createBlobChunkSource(args) {
  const { blob, outputByteRate } = (function () {
    let ret = {};
    if (!("blob" in args)) {
      throw "Argument \"blob\" must be provided.";
    }
    ret.blob = args.blob;
    if (!("outputByteRate" in args)) {
      throw "Argument \"outputByteRate\" must be provided.";
    }
    ret.outputByteRate = args.outputByteRate;
    return ret;
  })();
  const blobChunk = new AsyncSource();
  blobChunk.init = async function () {
    try {
      return {
        blob: blob,
        blobIndex: 0,
        outputByteRate: outputByteRate,
      };
    } catch (e) {
      ErrorLog.rethrow({
        functionName: "BlobChunkSource.init",
        error: e,
      });
    }
  }
  blobChunk.execute = async function (args) {
    try {
      const { state } = (function () {
        let ret = {};
        if (!("state" in args)) {
          throw "Argument \"state\" must be provided.";
        }
        ret.state = args.state;
        return ret;
      })();
      if (state.blobIndex >= state.blob.size) {
        return null;
      }
      const thisSlice = (function () {
        if (state.blobIndex + state.outputByteRate > state.blob.size) {
          return state.blob.slice(state.blobIndex);
        } else {
          return state.blob.slice(state.blobIndex, state.blobIndex + state.outputByteRate);
        }
      })();
      state.blobIndex += thisSlice.size;
      const arrayBuffer = await thisSlice.arrayBuffer();
      const block = new Memory.Block({
        arrayBuffer: arrayBuffer,
      });
      const view = new Memory.View(block);
      return view;
    } catch (e) {
      ErrorLog.rethrow({
        functionName: "BlobChunkSource.execute",
        error: e,
      });
    }
  }
  return blobChunk;
}
